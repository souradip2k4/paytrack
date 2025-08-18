import {
	Calendar,
	CircleDashed,
	Contrast,
	DollarSign,
	LucideIcon,
	User,
} from "lucide-react";

export const icons: Record<string, LucideIcon> = {
	amount: DollarSign,
	creator: User,
	transaction_date: Calendar,
	category: CircleDashed,
	status: Contrast,
};
