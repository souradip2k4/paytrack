"use client";

import { ClientSection } from "./client-section";
import { CompanySection } from "./company-section";
import { ExtrasSection } from "./extras-section";
import { ItemsSection } from "./items-section";
import { MetaSection } from "./meta-section";
import { ThemeSection } from "./theme-section";

export function DocumentForm() {
	return (
		<div className="flex flex-col gap-4">
			<ThemeSection />
			<CompanySection />
			<ClientSection />
			<MetaSection />
			<ItemsSection />
			<ExtrasSection />
		</div>
	);
}
