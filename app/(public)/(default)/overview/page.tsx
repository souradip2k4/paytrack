import BudgetbeeDashboardImg from "@/public/images/budgetbee_dashboard.png";

export default function Overview() {
	return (
		<div className="legal__markdown mx-auto flex flex-col gap-2 px-4 py-16 lg:w-1/2 [&>ul]:flex [&>ul]:list-disc [&>ul]:flex-col [&>ul]:gap-2">
			<h1>Overview</h1>
			<p>
				Budgetbee is a free budgeting tool that lets you track your
				expenses and monitor your budget. It&apos;s easy to use and
				customizable, so you can tailor it to your needs.
			</p>

			<div className="mt-4 w-full rounded-md bg-black/20 p-4">
				<img
					src={BudgetbeeDashboardImg.src}
					className="w-full rounded-md"
				/>
			</div>

			{/*<iframe
				className="aspect-video w-full"
				src="https://player.vimeo.com/video/1077981992?autoplay=1&byline=0&controls=0&loop=1&portrait=0&title=0"
				allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen"
				title="Filtering data in budgetbee"></iframe>
			<script src="https://player.vimeo.com/api/player.js"></script>*/}
		</div>
	);
}
