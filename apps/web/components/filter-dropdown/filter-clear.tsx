"use client";

import { useFilterStore } from "@/lib/store";
import { Button } from "@budgetbee/ui/core/button";
import { X } from "lucide-react";

export function FilterClear() {
	const status = useFilterStore(s => s.filter_stack);
	const clear = useFilterStore(s => s.filter_clear);
	if (status.length === 0) return null;
	return (
		<Button variant="destructive" size="sm" onClick={clear}>
			<X /> Clear
		</Button>
	);
}
