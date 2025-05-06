import React from "react";
import { options } from "./pricing";
import { PricingCard } from "./pricing-card";

export function PricingCardGroup() {
	return (
		<div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
			{options.map((option, index) => (
				<React.Fragment key={index}>
					<PricingCard option={option} />
				</React.Fragment>
			))}
		</div>
	);
}

export function PricingSection() {
	return (
		<div
			id="pricing"
			className="flex flex-col items-center justify-center gap-2 px-8 py-8 lg:space-y-8 lg:px-32 lg:py-24">
			<h1 className="text-2xl text-white lg:text-5xl">Pricing</h1>
			<PricingCardGroup />
		</div>
	);
}
