import { nanoid } from "nanoid";
import { create } from "zustand";

function getOrCreateClientId(): string {
	if (typeof window === "undefined") return "ssr";
	const stored = localStorage.getItem("sync_client_id");
	if (stored) return stored;
	const id = nanoid();
	localStorage.setItem("sync_client_id", id);
	return id;
}

type SyncError = {
	table: string;
	record_id: string;
	message: string;
} | null;

type SyncStore = {
	isOnline: boolean;
	isSseConnected: boolean;
	isSyncing: boolean;
	syncingTables: Set<string>;
	pendingCount: number;
	conflictCount: number;
	lastSyncedAt: string | null;
	lastError: SyncError;
	clientId: string;

	setOnline: (v: boolean) => void;
	setSseConnected: (v: boolean) => void;
	setSyncingTable: (table: string, syncing: boolean) => void;
	setPendingCount: (n: number) => void;
	incrementConflictCount: () => void;
	setLastSyncedAt: (iso: string) => void;
	setLastError: (e: SyncError) => void;
};

export const useSyncStore = create<SyncStore>((set, get) => ({
	isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
	isSseConnected: false,
	isSyncing: false,
	syncingTables: new Set(),
	pendingCount: 0,
	conflictCount: 0,
	lastSyncedAt: null,
	lastError: null,
	clientId: getOrCreateClientId(),

	setOnline: v => set({ isOnline: v }),
	setSseConnected: v => set({ isSseConnected: v }),

	setSyncingTable: (table, syncing) => {
		const tables = new Set(get().syncingTables);
		if (syncing) tables.add(table);
		else tables.delete(table);
		set({ syncingTables: tables, isSyncing: tables.size > 0 });
	},

	setPendingCount: n => set({ pendingCount: n }),
	incrementConflictCount: () =>
		set(s => ({ conflictCount: s.conflictCount + 1 })),
	setLastSyncedAt: iso => set({ lastSyncedAt: iso }),
	setLastError: e => set({ lastError: e }),
}));
