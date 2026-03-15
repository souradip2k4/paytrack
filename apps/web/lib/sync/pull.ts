import type { QueryClient } from "@tanstack/react-query";
import { getLocalDb, type SyncableTable } from "./dexie";
import { useSyncStore } from "./sync-store";

type PullResponse = {
	table: SyncableTable;
	records: Record<string, unknown>[];
	has_more: boolean;
	next_cursor: number;
	pulled_at: string;
	total_count: number;
};

const PULL_LIMIT = 500;

/**
 * Minimum time between background pulls from queryFn for the same table+user scope.
 * This prevents an infinite loop: queryFn → triggerPull → invalidateQueries → queryFn → …
 * SSE-triggered pulls and explicit hydration bypass this cooldown.
 */
const BACKGROUND_PULL_COOLDOWN_MS = 30_000;
const _lastBackgroundPull = new Map<string, number>();

/**
 * Delta pull for a single table.
 * Reads the cursor from Dexie, fetches changed records from the server,
 * writes them to Dexie (skipping records with pending local changes),
 * then updates the cursor and invalidates TanStack Query.
 *
 * @param skipCooldown - set to true for SSE-triggered or initial hydration pulls
 */
export async function triggerPull(
	table: SyncableTable,
	queryClient: QueryClient,
	userId: string,
	organizationId: string | null | undefined,
	skipCooldown = false,
): Promise<void> {
	const cooldownKey = `${userId}:${organizationId ?? "personal"}:${table}`;

	// Enforce cooldown for background queryFn pulls to prevent infinite invalidation loops
	if (!skipCooldown) {
		const last = _lastBackgroundPull.get(cooldownKey) ?? 0;
		if (Date.now() - last < BACKGROUND_PULL_COOLDOWN_MS) return;
	}
	_lastBackgroundPull.set(cooldownKey, Date.now());

	// Deduplicate concurrent pulls for the same table+scope
	const { syncingTables, setSyncingTable, setLastSyncedAt } =
		useSyncStore.getState();
	if (syncingTables.has(table)) return;

	const db = getLocalDb();
	const cursorId = cooldownKey;

	setSyncingTable(table, true);
	try {
		const cursorRow = await db.sync_cursors.get(cursorId);
		const since = cursorRow?.last_pulled_at;

		let cursor = 0;
		let hasMore = true;
		let pulledAny = false;

		while (hasMore) {
			const params = new URLSearchParams({
				table,
				limit: String(PULL_LIMIT),
				cursor: String(cursor),
			});
			if (since) params.set("since", since);

			const res = await fetch(`/api/sync/pull?${params.toString()}`);
			if (!res.ok) {
				console.error(`[sync] pull failed for ${table}: ${res.status}`);
				break;
			}

			const body: PullResponse = await res.json();

			// Write records — skip those with pending local changes or fresher local data
			const ids = body.records.map(r => r.id as string);
			const existingRecords = await (db[table] as any).bulkGet(ids);
			const existingMap = new Map<string, any>();
			for (let i = 0; i < ids.length; i++) {
				const id = ids[i]!;
				if (existingRecords[i]) existingMap.set(id, existingRecords[i]);
			}

			const toWrite: any[] = [];
			for (const record of body.records) {
				const id = record.id as string;
				const existing = existingMap.get(id);
				if (existing?._sync_state === "pending") continue;
				// Skip if local record has a newer updated_at than the pulled record
				if (
					existing?.updated_at &&
					record.updated_at &&
					new Date(existing.updated_at) > new Date(record.updated_at as string)
				) continue;

				toWrite.push({
					...record,
					_sync_state: "synced",
					_synced_at: body.pulled_at,
					_client_id: null,
				});
			}
			if (toWrite.length > 0) {
				await (db[table] as any).bulkPut(toWrite);
				pulledAny = true;
			}

			if (body.has_more) {
				cursor = body.next_cursor;
			} else {
				await db.sync_cursors.put({
					id: cursorId,
					last_pulled_at: body.pulled_at,
				});
				hasMore = false;
			}
		}

		setLastSyncedAt(new Date().toISOString());

		// Only invalidate if we actually wrote new data — avoids spurious re-renders
		if (pulledAny) {
			const queryKeyMap: Record<SyncableTable, unknown[]> = {
				transactions: ["tr", "get"],
				categories: ["cat", "get"],
				subscriptions: ["subscriptions", "get"],
				dashboard_views: ["dashboard"],
			};
			queryClient.invalidateQueries({
				queryKey: queryKeyMap[table],
				exact: false,
			});
		}
	} catch (err) {
		console.error(`[sync] pull error for ${table}:`, err);
	} finally {
		setSyncingTable(table, false);
	}
}
