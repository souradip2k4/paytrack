import type { QueryClient } from "@tanstack/react-query";
import { getLocalDb, type SyncableTable } from "./dexie";
import { triggerPull } from "./pull";

const SYNCABLE_TABLES: SyncableTable[] = [
	"transactions",
	"categories",
	"subscriptions",
	"dashboard_views",
];

/**
 * On first load for this device/user, trigger a full pull for each table (no `since` cursor).
 * Subsequent loads serve from Dexie instantly and delta-pull lazily from queryFn.
 */
export async function runInitialHydration(
	queryClient: QueryClient,
	userId: string,
	organizationId: string | null | undefined,
): Promise<void> {
	const db = getLocalDb();

	await Promise.all(
		SYNCABLE_TABLES.map(async table => {
			const cursorId = `${userId}:${organizationId ?? "personal"}:${table}`;
			const cursor = await db.sync_cursors.get(cursorId);
			if (!cursor) {
				// first time on this device — full pull, no `since`; bypass cooldown
				await triggerPull(
					table,
					queryClient,
					userId,
					organizationId,
					true,
				);
			}
		}),
	);
}
