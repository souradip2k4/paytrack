import { EntriesTable } from "@/components/entries-table";
import React from "react";

export default async function Page() {
	return (
		<React.Suspense>
			<EntriesTable />
		</React.Suspense>
	);
}
