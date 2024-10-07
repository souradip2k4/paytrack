import React from "react";

export default function LayoutAuth({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="w-full h-full min-h-screen flex items-center justify-center">
			{children}
		</div>
	);
}
