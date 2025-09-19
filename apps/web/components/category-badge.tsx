import { hashStr } from "@/lib/hash";
import { cn } from "@/lib/utils";

/*const variants = [
    "bg-[#ebebeb] dark:bg-[#1f1f1f] text-[#171717] dark:text-[#ededed] fill-[#171717] dark:fill-[#ededed]", // gray
    "bg-[#e9f4ff] dark:bg-[#022248] text-[#005ff2] dark:text-[#47a8ff] fill-[#005ff2] dark:fill-[#47a8ff]", // blue
    "bg-[#f9f0ff] dark:bg-[#341142] text-[#7d00cc] dark:text-[#c472fb] fill-[#7d00cc] dark:fill-[#c472fb]", // purple
    "bg-[#fff4cf] dark:bg-[#361900] text-[#aa4d00] dark:text-[#ff9300] fill-[#aa4d00] dark:fill-[#ff9300]", // amber
    "bg-[#ffe8ea] dark:bg-[#440d13] text-[#d8001b] dark:text-[#ff565f] fill-[#d8001b] dark:fill-[#ff565f]", // red
    "bg-[#ffdfeb] dark:bg-[#571032] text-[#c41562] dark:text-[#ff4d8d] fill-[#c41562] dark:fill-[#ff4d8d]", // pink
    "bg-[#e5fce7] dark:bg-[#00320b] text-[#107d32] dark:text-[#00ca50] fill-[#107d32] dark:fill-[#00ca50]", // green
    "bg-[#ccf9f1] dark:bg-[#003d34] text-[#007f70] dark:text-[#00cfb7] fill-[#007f70] dark:fill-[#00cfb7]", // teal
];*/

const variants = [
	"bg-red-500/10 text-red-500 border-red-500/40",
	"bg-orange-500/10 text-orange-500 border-orange-500/40",
	"bg-amber-500/10 text-yellow-500 border-amber-500/40",
	"bg-yellow-500/10 text-yellow-500 border-yellow-500/40",
	"bg-lime-500/10 text-lime-500 border-lime-500/40",
	"bg-green-500/10 text-green-500 border-green-500/40",
	"bg-emerald-500/10 text-emerald-500 border-emerald-500/40",
	"bg-teal-500/10 text-teal-500 border-teal-500/40",
	"bg-cyan-500/10 text-cyan-500 border-cyan-500/40",
	"bg-sky-500/10 text-sky-500 border-sky-500/40",
	"bg-indigo-500/10 text-indigo-500 border-indigo-500/40",
	"bg-violet-500/10 text-violet-500 border-violet-500/40",
	"bg-purple-500/10 text-purple-500 border-purple-500/40",
	"bg-fuchsia-500/10 text-fuchsia-500 border-fuchsia-500/40",
	"bg-pink-500/10 text-pink-500 border-pink-500/40",
	// "bg-slate-500/10 text-slate-500 border-slate-500",
	// "bg-gray-500/10 text-gray-500 border-gray-500",
	// "bg-zinc-500/10 text-zinc-500 border-zinc-500",
	// "bg-neutral-500/10 text-neutral-500 border-neutral-500",
	// "bg-stone-500/10 text-stone-500 border-stone-500",
];

export function CategoryBadge({ category }: { category: string }) {
	return (
		<div
			className={cn(
				"inline-flex w-fit items-center gap-2 rounded-full border px-2 py-1",
				variants[hashStr(category || "", variants.length)],
			)}>
			<pre className="text-xs">{category}</pre>
		</div>
	);
}
