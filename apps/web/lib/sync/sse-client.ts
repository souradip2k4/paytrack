import type { QueryClient } from "@tanstack/react-query";
import type { SyncableTable } from "./dexie";
import { triggerPull } from "./pull";
import { useSyncStore } from "./sync-store";

type SseEvent = {
	table: SyncableTable;
	operation: string;
	record_ids: string[];
	origin_client_id: string;
};

/**
 * Opens an SSE connection to /api/sync/sse.
 * Session cookie is sent automatically by the browser.
 * Returns a cleanup function.
 */
export function initSseConnection(
	queryClient: QueryClient,
	userId: string,
	organizationId: string | null | undefined,
): () => void {
	const { setSseConnected, clientId } = useSyncStore.getState();

	const es = new EventSource("/api/sync/sse");

	es.addEventListener("open", () => {
		setSseConnected(true);
	});

	es.addEventListener("sync", async (e: MessageEvent) => {
		let payload: SseEvent;
		try {
			payload = JSON.parse(e.data);
		} catch {
			return;
		}

		// Skip if we are the originator of this change
		if (payload.origin_client_id === clientId) return;

		// SSE-triggered pull always bypasses the background cooldown
		await triggerPull(
			payload.table,
			queryClient,
			userId,
			organizationId,
			true,
		);
	});

	es.addEventListener("ping", () => {
		// Keepalive — no action needed
	});

	es.addEventListener("error", () => {
		setSseConnected(false);
		// EventSource reconnects automatically
	});

	return () => {
		es.close();
		setSseConnected(false);
	};
}
