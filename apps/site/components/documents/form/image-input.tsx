"use client";

import { Button } from "@budgetbee/ui/core/button";
import { Upload, X } from "lucide-react";
import { useRef, useState } from "react";

const MAX_BYTES = 1_000_000;

export function ImageInput({
	value,
	onChange,
	label,
}: {
	value: string;
	onChange: (next: string) => void;
	label: string;
}) {
	const inputRef = useRef<HTMLInputElement | null>(null);
	const [error, setError] = useState<string | null>(null);

	const onFile = (file: File | null) => {
		setError(null);
		if (!file) return;
		if (!file.type.startsWith("image/")) {
			setError("File must be an image");
			return;
		}
		if (file.size > MAX_BYTES) {
			setError("Image must be under 1MB");
			return;
		}
		const reader = new FileReader();
		reader.onload = () => onChange(String(reader.result ?? ""));
		reader.onerror = () => setError("Could not read file");
		reader.readAsDataURL(file);
	};

	return (
		<div className="flex flex-col gap-2">
			{value ?
				<div className="border-border relative inline-flex items-center justify-center rounded-md border bg-white p-2">
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img
						src={value}
						alt={label}
						className="max-h-24 max-w-[12rem] object-contain"
					/>
					<button
						type="button"
						onClick={() => onChange("")}
						className="bg-background hover:bg-muted absolute -right-2 -top-2 inline-flex size-6 items-center justify-center rounded-full border shadow-sm"
						aria-label={`Remove ${label}`}>
						<X className="size-3.5" />
					</button>
				</div>
			:	<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={() => inputRef.current?.click()}
					className="self-start">
					<Upload className="size-3.5" />
					Upload {label}
				</Button>
			}
			<input
				ref={inputRef}
				type="file"
				accept="image/*"
				className="hidden"
				onChange={e => onFile(e.target.files?.[0] ?? null)}
			/>
			{error ?
				<span className="text-destructive text-xs">{error}</span>
			:	<span className="text-muted-foreground text-xs">
					PNG, JPG or SVG. Max 1MB.
				</span>
			}
		</div>
	);
}
