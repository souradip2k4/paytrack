"use client";

import { useStore } from "@/lib/store/store";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { DayPicker } from "react-day-picker";
import { SubscriptionDialog } from "./subscription-dialog";

export function SubscriptionCalendar() {
	const { modal_subscription_set_open, modal_subscription_set_date } =
		useStore();
	const openSubscriptionModal = (date: Date) => {
		modal_subscription_set_open(true);
		modal_subscription_set_date(date);
	};
	return (
		<div className="p-8">
			<SubscriptionDialog />
			<DayPicker
				captionLayout="dropdown"
				disableNavigation
				components={{
					HeadRow: () => {
						return (
							<tr className="bg-muted">
								{[
									"Sun",
									"Mon",
									"Tue",
									"Wed",
									"Thu",
									"Fri",
									"Sat",
								].map((day, i) => (
									<th
										key={i}
										className="w-1/7 border-r px-2 py-1 text-right text-xs font-normal">
										{day}
									</th>
								))}
							</tr>
						);
					},

					Caption: () => null,

					Day: props => {
						const { displayMonth, date } = props;
						const isOutside =
							displayMonth.getMonth() !== date.getMonth();
						return (
							<div
								aria-disabled={isOutside}
								className={cn(
									"bg-background h-full w-full p-2 hover:brightness-125",
									isOutside ? "bg-muted/20" : "",
								)}
								onClick={() => openSubscriptionModal(date)}>
								<p
									className={cn(
										"w-full text-right",
										isOutside ?
											"text-muted-foreground"
										:	"",
									)}>
									{format(date, "MMM, dd")}
								</p>
							</div>
						);
					},
				}}
			/>
		</div>
	);
}
