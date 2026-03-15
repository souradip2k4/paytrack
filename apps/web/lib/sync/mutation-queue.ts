import { nanoid } from "nanoid";
import {
	getLocalDb,
	type MutationQueueEntry,
	type SyncableTable,
} from "./dexie";
import { useSyncStore } from "./sync-store";

type EnqueueArgs = {
	table: SyncableTable;
	operation: "insert" | "update" | "delete";
	record_id: string;
	patch: Record<string, unknown>;
};

export async function enqueueMutation(args: EnqueueArgs): Promise<void> {
	const db = getLocalDb();
	// Strip Dexie-only meta fields at enqueue time so the queue always stores clean patches
	const cleanPatch = Object.fromEntries(
		Object.entries(args.patch).filter(([k]) => !k.startsWith("_")),
	);
	const entry: MutationQueueEntry = {
		id: nanoid(),
		table: args.table,
		operation: args.operation,
		record_id: args.record_id,
		patch: cleanPatch,
		created_at: new Date().toISOString(),
		attempt_count: 0,
		next_attempt_at: new Date().toISOString(),
		error: null,
	};
	await db.mutation_queue.add(entry);
	const count = await db.mutation_queue.count();
	useSyncStore.getState().setPendingCount(count);
}

/**
 * Reduce a sequence of operations on the same (table, record_id) to the
 * minimal set of server calls needed, processed in creation order.
 *
 * Rules (think of these as algebraic identities):
 *   insert + update  → insert  (merge patch into insert's payload)
 *   insert + delete  → (nothing — net no-op, never reached server)
 *   update + update  → update  (merge patches, later fields win)
 *   update + delete  → delete  (delete supersedes any pending updates)
 *   delete + *       → delete  (once deleted, nothing else matters)
 */
function deduplicateEntries(
	entries: MutationQueueEntry[],
): MutationQueueEntry[] {
	// Process in creation order (entries are already sorted by created_at)
	const result = new Map<string, MutationQueueEntry | null>();

	for (const entry of entries) {
		const key = `${entry.table}:${entry.record_id}`;
		const existing = result.get(key);

		if (existing === undefined) {
			// First time we see this (table, record_id)
			result.set(key, entry);
			continue;
		}

		if (existing === null) {
			// Already cancelled (insert+delete), ignore further entries
			continue;
		}

		const prev = existing.operation;
		const next = entry.operation;

		if (prev === "insert" && next === "update") {
			// Absorb the update into the insert — still an insert
			result.set(key, {
				...existing,
				patch: { ...existing.patch, ...entry.patch },
			});
		} else if (prev === "insert" && next === "delete") {
			// Net no-op — the record never needs to reach the server
			result.set(key, null);
		} else if (prev === "update" && next === "update") {
			// Merge patches — later fields win
			result.set(key, {
				...existing,
				patch: { ...existing.patch, ...entry.patch },
			});
		} else if (prev === "update" && next === "delete") {
			// Delete supersedes any pending update
			result.set(key, entry);
		} else {
			// delete + anything, or any other combination — last entry wins
			result.set(key, entry);
		}
	}

	return Array.from(result.values()).filter(
		(e): e is MutationQueueEntry => e !== null,
	);
}

const MAX_ATTEMPTS = 7;

// Prevent concurrent flushes — a second call schedules a re-flush after the current one
let _flushLock = false;
let _reflushNeeded = false;

export async function flushQueue(): Promise<void> {
	if (typeof window === "undefined") return;
	if (!navigator.onLine) return;
	if (_flushLock) {
		_reflushNeeded = true;
		return;
	}

	_flushLock = true;
	try {
		await _doFlush();
		// If another mutation was enqueued during the flush, run again
		if (_reflushNeeded) {
			_reflushNeeded = false;
			await _doFlush();
		}
	} finally {
		_flushLock = false;
	}
}

async function _doFlush(): Promise<void> {
	const db = getLocalDb();
	const now = new Date().toISOString();

	// Collect all entries due for processing, sorted by creation time
	const due = await db.mutation_queue
		.where("next_attempt_at")
		.belowOrEqual(now)
		.sortBy("created_at");

	if (due.length === 0) return;

	const deduplicated = deduplicateEntries(due);

	// Handle null results (insert+delete cancelled each other) — clean up queue
	const cancelled = due.filter(
		e =>
			!deduplicated.some(
				d => d.record_id === e.record_id && d.table === e.table,
			),
	);
	if (cancelled.length > 0) {
		await db.mutation_queue.bulkDelete(cancelled.map(e => e.id));
	}

	for (const entry of deduplicated) {
		try {
			// Strip Dexie-only meta fields — they must never reach the server
			const serverPatch = Object.fromEntries(
				Object.entries(entry.patch).filter(([k]) => !k.startsWith("_")),
			);

			const res = await fetch("/api/sync/merge", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					table: entry.table,
					operation: entry.operation,
					record_id: entry.record_id,
					patch: serverPatch,
					idempotency_key: entry.id,
				}),
			});

			if (!res.ok) {
				throw new Error(`HTTP ${res.status}: ${await res.text()}`);
			}

			const { record } = await res.json();

			// Overwrite optimistic Dexie state with server-confirmed record
			if (record) {
				await (db[entry.table] as any).put({
					...record,
					_sync_state: "synced",
					_synced_at: new Date().toISOString(),
					_client_id: null,
				});
			} else {
				// Server returned no record (e.g. update matched 0 rows — race condition)
				// Leave the local state as-is; the next pull will reconcile
				await (db[entry.table] as any).update(entry.record_id, {
					_sync_state: "synced",
				});
			}

			// Delete all original queue entries for this (table, record_id)
			const allForRecord = await db.mutation_queue
				.where("record_id")
				.equals(entry.record_id)
				.toArray();
			await db.mutation_queue.bulkDelete(allForRecord.map(e => e.id));

			// Notify other devices via Redis pub/sub
			fetch("/api/sync/notify", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					table: entry.table,
					operation: entry.operation,
					record_ids: [entry.record_id],
					origin_client_id: useSyncStore.getState().clientId,
				}),
			}).catch(console.error);
		} catch (err) {
			const message = err instanceof Error ? err.message : String(err);
			console.error(
				`[sync/flush] error on ${entry.operation} ${entry.table}:`,
				message,
			);

			// Find the original entry to update its retry state
			const original = await db.mutation_queue.get(entry.id);
			if (!original) continue;

			const nextAttempt = original.attempt_count + 1;

			if (nextAttempt >= MAX_ATTEMPTS) {
				// Give up — mark as conflict for user-visible resolution
				await (db[entry.table] as any).update(entry.record_id, {
					_sync_state: "conflict",
				});
				await db.mutation_queue.delete(entry.id);
				useSyncStore.getState().incrementConflictCount();
				useSyncStore.getState().setLastError({
					table: entry.table,
					record_id: entry.record_id,
					message,
				});
			} else {
				// Exponential backoff: 1s → 2s → 4s → … → 64s max
				const delayMs = Math.min(
					1000 * Math.pow(2, nextAttempt),
					64_000,
				);
				const nextAt = new Date(Date.now() + delayMs).toISOString();
				await db.mutation_queue.update(entry.id, {
					attempt_count: nextAttempt,
					next_attempt_at: nextAt,
					error: message,
				});
			}
		}
	}

	const remaining = await db.mutation_queue.count();
	useSyncStore.getState().setPendingCount(remaining);
}
