import { UserProfile } from "@clerk/nextjs";
import React from "react";

export default function Page() {
	return (
		<div>
			<UserProfile
				appearance={{
					elements: {
						rootBox: { width: "100%" },
						cardBox: {
							border: "none",
							width: "100%",
						},
					},
				}}
			/>
		</div>
	);
}
