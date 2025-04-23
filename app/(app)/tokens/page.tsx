"use client";

import { TokensTable } from "@/components/tokens-table";
import CreateApiKeyButton from "@/components/tokens-table/create-api-key-button";

export default function Page() {
	return (
		<div className="space-y-4">
			<div className="flex items-center gap-4">
				<div className="grow"></div>
				<CreateApiKeyButton />
			</div>
			<TokensTable />
		</div>
	);
}
