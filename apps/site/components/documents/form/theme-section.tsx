"use client";

import { Input } from "@budgetbee/ui/core/input";
import { TEMPLATE_IDS, type TemplateId } from "@/lib/documents/schema";
import { useDocument } from "../document-context";
import { Field, SectionCard } from "./field";

const TEMPLATE_LABELS: Record<TemplateId, string> = {
	classic: "Classic",
	modern: "Modern",
};

export function ThemeSection() {
	const { doc, setDoc } = useDocument();

	return (
		<SectionCard
			title="Look & feel"
			description="Pick a template and tweak the colors.">
			<Field label="Template">
				<div className="grid grid-cols-2 gap-2">
					{TEMPLATE_IDS.map(id => {
						const active = doc.template === id;
						return (
							<button
								key={id}
								type="button"
								onClick={() =>
									setDoc(prev => ({ ...prev, template: id }))
								}
								className={
									"rounded-md border px-3 py-2 text-sm transition-colors " +
									(active ?
										"border-primary bg-primary text-primary-foreground"
									:	"border-border hover:bg-muted")
								}>
								{TEMPLATE_LABELS[id]}
							</button>
						);
					})}
				</div>
			</Field>
			<div className="grid gap-3 sm:grid-cols-2">
				<Field label="Primary color">
					<div className="flex items-center gap-2">
						<input
							type="color"
							value={doc.theme.primary}
							onChange={e =>
								setDoc(prev => ({
									...prev,
									theme: {
										...prev.theme,
										primary: e.target.value,
									},
								}))
							}
							className="border-input h-9 w-12 cursor-pointer rounded-md border"
						/>
						<Input
							value={doc.theme.primary}
							onChange={e =>
								setDoc(prev => ({
									...prev,
									theme: {
										...prev.theme,
										primary: e.target.value,
									},
								}))
							}
						/>
					</div>
				</Field>
				<Field label="Accent color">
					<div className="flex items-center gap-2">
						<input
							type="color"
							value={doc.theme.accent}
							onChange={e =>
								setDoc(prev => ({
									...prev,
									theme: {
										...prev.theme,
										accent: e.target.value,
									},
								}))
							}
							className="border-input h-9 w-12 cursor-pointer rounded-md border"
						/>
						<Input
							value={doc.theme.accent}
							onChange={e =>
								setDoc(prev => ({
									...prev,
									theme: {
										...prev.theme,
										accent: e.target.value,
									},
								}))
							}
						/>
					</div>
				</Field>
			</div>
		</SectionCard>
	);
}
