import {
	Calendar,
	CalendarClock,
	CircleDashed,
	Contrast,
	DollarSign,
	LucideIcon,
	RefreshCw,
	User,
} from "lucide-react";

export const icons: Record<string, LucideIcon> = {
	amount: DollarSign,
	creator: User,
	user: User,
	transaction_date: Calendar,
	created_at: CalendarClock,
	updated_at: RefreshCw,
	category: CircleDashed,
	status: Contrast,
};
