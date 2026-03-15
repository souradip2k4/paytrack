// In Next.js, this file would be called: app/providers.jsx
"use client";

import { ThemeProvider } from "@/components/theme-provider";
// We can not useState or useRef in a server component, which is why we are
// extracting this part out into it's own file with 'use client' on top
import { authClient } from "@budgetbee/core/auth-client";
import {
	QueryClient,
	QueryClientProvider,
	useQueryClient,
} from "@tanstack/react-query";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import React from "react";

function makeQueryClient() {
	return new QueryClient({
		defaultOptions: {
			queries: {
				// With SSR, we usually want to set some default staleTime
				// above 0 to avoid refetching immediately on the client
				staleTime: 60 * 1000,
			},
		},
	});
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
	if (typeof window === "undefined") {
		// Server: always make a new query client
		return makeQueryClient();
	} else {
		// Browser: make a new query client if we don't already have one
		// This is very important so we don't re-make a new client if React
		// suspends during the initial render. This may not be needed if we
		// have a suspense boundary BELOW the creation of the query client
		if (!browserQueryClient) browserQueryClient = makeQueryClient();
		return browserQueryClient;
	}
}

function SyncProvider({ children }: { children: React.ReactNode }) {
	const { data: session } = authClient.useSession();
	const queryClient = useQueryClient();

	const userId = session?.user?.id;
	const orgId = session?.session?.activeOrganizationId;

	React.useEffect(() => {
		if (!userId) return;

		const cleanupFns: (() => void)[] = [];
		let cancelled = false;

		// Lazy import to keep SSR safe
		import("@/lib/sync").then(
			({
				runInitialHydration,
				initSseConnection,
				flushQueue,
				useSyncStore,
			}) => {
				if (cancelled) return;

				// Initial hydration
				runInitialHydration(queryClient, userId, orgId).catch(
					console.error,
				);

				// SSE connection
				const closeSse = initSseConnection(
					queryClient,
					userId,
					orgId,
				);
				cleanupFns.push(closeSse);

				// Online/offline listeners
				const handleOnline = () => {
					useSyncStore.getState().setOnline(true);
					flushQueue().catch(console.error);
				};
				const handleOffline = () => {
					useSyncStore.getState().setOnline(false);
				};

				window.addEventListener("online", handleOnline);
				window.addEventListener("offline", handleOffline);
				cleanupFns.push(() => {
					window.removeEventListener("online", handleOnline);
					window.removeEventListener("offline", handleOffline);
				});

				// Safety flush interval every 30s
				const flushInterval = setInterval(() => {
					flushQueue().catch(console.error);
				}, 30_000);
				cleanupFns.push(() => clearInterval(flushInterval));
			},
		);

		return () => {
			cancelled = true;
			cleanupFns.forEach(fn => fn());
		};
	}, [userId, orgId, queryClient]);

	return <>{children}</>;
}

export default function Providers({ children }: { children: React.ReactNode }) {
	// NOTE: Avoid useState when initializing the query client if you don't
	//       have a suspense boundary between this and the code that may
	//       suspend because React will throw away the client on the initial
	//       render if it suspends and there is no boundary
	const queryClient = getQueryClient();

	return (
		<ThemeProvider
			attribute="class"
			defaultTheme="system"
			enableSystem
			disableTransitionOnChange>
			<QueryClientProvider client={queryClient}>
				<NuqsAdapter>
					<SyncProvider>{children}</SyncProvider>
				</NuqsAdapter>
			</QueryClientProvider>
		</ThemeProvider>
	);
}
