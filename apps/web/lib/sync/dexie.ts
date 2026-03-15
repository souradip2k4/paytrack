import Dexie, { type Table } from "dexie";

export type SyncState = "synced" | "pending" | "conflict";

export type SyncMeta = {
	_sync_state: SyncState;
	_client_id: string | null;
	_synced_at: string | null;
};

export type SyncableTable =
	| "transactions"
	| "categories"
	| "subscriptions"
	| "dashboard_views";

// ---- Local record types ----
export type LocalTransaction = Record<string, unknown> &
	SyncMeta & {
		id: string;
		user_id: string | null;
		organization_id: string | null;
		updated_at: string | null;
		deleted_at: string | null;
	};

export type LocalCategory = Record<string, unknown> &
	SyncMeta & {
		id: string;
		user_id: string | null;
		organization_id: string | null;
		updated_at: string | null;
		deleted_at: string | null;
	};

export type LocalSubscription = Record<string, unknown> &
	SyncMeta & {
		id: string;
		user_id: string | null;
		organization_id: string | null;
		updated_at: string | null;
		deleted_at: string | null;
	};

export type LocalDashboardView = Record<string, unknown> &
	SyncMeta & {
		id: string;
		user_id: string | null;
		organization_id: string | null;
		updated_at: string | null;
		deleted_at: string | null;
	};

// ---- Mutation queue ----
export type MutationQueueEntry = {
	id: string; // nanoid() — idempotency key
	table: SyncableTable;
	operation: "insert" | "update" | "delete";
	record_id: string; // domain record UUID
	patch: Record<string, unknown>; // insert: full record; update: changed fields only; delete: {}
	created_at: string; // ISO
	attempt_count: number;
	next_attempt_at: string; // ISO — exponential backoff
	error: string | null;
};

// ---- Sync cursors ----
export type SyncCursor = {
	id: string; // `${user_id}:${org_id ?? 'personal'}:${table}`
	last_pulled_at: string; // ISO
};

// ---- Dexie database ----
export class LocalSyncDb extends Dexie {
	transactions!: Table<LocalTransaction>;
	categories!: Table<LocalCategory>;
	subscriptions!: Table<LocalSubscription>;
	dashboard_views!: Table<LocalDashboardView>;
	mutation_queue!: Table<MutationQueueEntry>;
	sync_cursors!: Table<SyncCursor>;

	constructor() {
		super("budgetbee_v1");
		this.version(1).stores({
			transactions:
				"id, user_id, organization_id, updated_at, deleted_at, _sync_state",
			categories:
				"id, user_id, organization_id, updated_at, deleted_at, _sync_state",
			subscriptions:
				"id, user_id, organization_id, updated_at, deleted_at, _sync_state",
			dashboard_views:
				"id, user_id, organization_id, updated_at, deleted_at, _sync_state",
			mutation_queue: "id, table, record_id, created_at, next_attempt_at",
			sync_cursors: "id",
		});
		// Add compound indexes for scoped queries (avoids full table scans)
		this.version(2).stores({
			transactions:
				"id, [organization_id+deleted_at], [user_id+deleted_at], updated_at, _sync_state",
			categories:
				"id, [organization_id+deleted_at], [user_id+deleted_at], updated_at, _sync_state",
			subscriptions:
				"id, [organization_id+deleted_at], [user_id+deleted_at], updated_at, _sync_state",
			dashboard_views:
				"id, [organization_id+deleted_at], [user_id+deleted_at], updated_at, _sync_state",
			mutation_queue: "id, table, record_id, created_at, next_attempt_at",
			sync_cursors: "id",
		});
	}
}

let _db: LocalSyncDb | null = null;

export function getLocalDb(): LocalSyncDb {
	if (typeof window === "undefined") {
		throw new Error("getLocalDb() must only be called in the browser");
	}
	if (!_db) {
		_db = new LocalSyncDb();
	}
	return _db;
}
