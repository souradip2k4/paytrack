import { PricingCardGroup } from "@/components/pricing";

export default function Page() {
	return (
		<div className="flex flex-col items-center justify-center px-4 py-8 lg:space-y-8 lg:px-8 lg:py-24">
			<h1 className="text-2xl text-white lg:text-5xl">Pricing</h1>
			<PricingCardGroup />
		</div>
	);
}
