import React from "react";

export default function Layout({
	children,
}: {
	children: Readonly<React.ReactNode>;
}) {
	return <div className="pt-8">{children}</div>;
}
