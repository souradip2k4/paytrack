import { hashStr } from "@/lib/hash";
import { cn } from "@/lib/utils";

const variants = [
	"bg-[#ebebeb] dark:bg-[#1f1f1f] text-[#171717] dark:text-[#ededed] fill-[#171717] dark:fill-[#ededed]", // gray
	"bg-[#e9f4ff] dark:bg-[#022248] text-[#005ff2] dark:text-[#47a8ff] fill-[#005ff2] dark:fill-[#47a8ff]", // blue
	"bg-[#f9f0ff] dark:bg-[#341142] text-[#7d00cc] dark:text-[#c472fb] fill-[#7d00cc] dark:fill-[#c472fb]", // purple
	"bg-[#fff4cf] dark:bg-[#361900] text-[#aa4d00] dark:text-[#ff9300] fill-[#aa4d00] dark:fill-[#ff9300]", // amber
	"bg-[#ffe8ea] dark:bg-[#440d13] text-[#d8001b] dark:text-[#ff565f] fill-[#d8001b] dark:fill-[#ff565f]", // red
	"bg-[#ffdfeb] dark:bg-[#571032] text-[#c41562] dark:text-[#ff4d8d] fill-[#c41562] dark:fill-[#ff4d8d]", // pink
	"bg-[#e5fce7] dark:bg-[#00320b] text-[#107d32] dark:text-[#00ca50] fill-[#107d32] dark:fill-[#00ca50]", // green
	"bg-[#ccf9f1] dark:bg-[#003d34] text-[#007f70] dark:text-[#00cfb7] fill-[#007f70] dark:fill-[#00cfb7]", // teal
];

export function CategoryBadge({ category }: { category: string }) {
	return (
		<div
			className={cn(
				"inline-flex items-center gap-2 rounded-full px-2 py-1",
				variants[hashStr(category || "", variants.length)],
			)}>
			<p className="text-xs">{category}</p>
		</div>
	);
}
