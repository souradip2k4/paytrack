"use client";

import { Card } from "@budgetbee/ui/core/card";
import { cn } from "@budgetbee/ui/lib/utils";
import type { ReactNode } from "react";
import React from "react";

function getTextContent(node: ReactNode): string {
	if (typeof node === "string" || typeof node === "number") {
		return String(node);
	}
	if (Array.isArray(node)) return node.map(getTextContent).join("");
	if (node && typeof node === "object" && "props" in node) {
		const maybeChildren = (node as { props?: { children?: ReactNode } }).props
			?.children;
		return getTextContent(maybeChildren);
	}
	return "";
}

export function MdxCodeBlock(props: any) {
	const { className, children, ...rest } = props;
	const [copied, setCopied] = React.useState(false);
	const copiedTimeoutRef = React.useRef<number | null>(null);

	const code = React.useMemo(
		() => getTextContent(children).trimEnd(),
		[children],
	);

	React.useEffect(() => {
		return () => {
			if (copiedTimeoutRef.current !== null) {
				window.clearTimeout(copiedTimeoutRef.current);
			}
		};
	}, []);

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(code);
			setCopied(true);
			if (copiedTimeoutRef.current !== null) {
				window.clearTimeout(copiedTimeoutRef.current);
			}
			copiedTimeoutRef.current = window.setTimeout(() => {
				setCopied(false);
			}, 1500);
		} catch {
			setCopied(false);
		}
	};

	return (
		<Card className="gap-0 p-0">
			<div className="relative my-4">
				<button
					type="button"
					onClick={handleCopy}
					className="bg-muted text-muted-foreground hover:text-foreground absolute right-2 top-2 rounded-md px-2 py-1 text-xs transition">
					{copied ? "Copied" : "Copy"}
				</button>
				<pre
					className={cn(
						"bg-card overflow-x-auto px-4 pt-10 text-sm",
						className,
					)}
					{...rest}>
					{children}
				</pre>
			</div>
		</Card>
	);
}
