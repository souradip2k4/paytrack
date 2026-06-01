import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const title = (searchParams.get("title") || "Paytrack Blog").slice(0, 140);

	return new ImageResponse(
		<div
			style={{
				height: "100%",
				width: "100%",
				display: "flex",
				flexDirection: "column",
				justifyContent: "space-between",
				backgroundColor: "#114B3B",
				backgroundImage:
					"radial-gradient(circle at 20% 20%, rgba(34, 197, 94, 0.4) 0%, rgba(34, 197, 94, 0) 45%)",
				color: "white",
				padding: "72px",
			}}>
			<div
				style={{
					fontSize: 34,
					letterSpacing: "-0.04em",
				}}>
				Paytrack Blog
			</div>
			<div
				style={{
					fontSize: 72,
					fontWeight: 700,
					lineHeight: 1.15,
					maxWidth: "95%",
				}}>
				{title}
			</div>
		</div>,
		{
			width: 1200,
			height: 630,
		},
	);
}
