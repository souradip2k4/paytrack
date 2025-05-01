"use client";

export type DateRange = {
	from?: Date;
	to?: Date;
};

/*export function DualDatePicker() {
    const from = useStore(s => s.filters.date?.from ?? today);
    const to = useStore(s => s.filters.date?.to ?? today);
    const setDateFilters = useStore(s => s.setDateFilters);
    return (
        <div className="flex">
            <div className="flex flex-col pt-8">
                <Button
                    variant="ghost"
                    className="w-full justify-start"
                    size="sm">
                    Today
                </Button>
                <Button
                    variant="ghost"
                    className="w-full justify-start"
                    size="sm">
                    Last 7 days
                </Button>
                <Button
                    variant="ghost"
                    className="w-full justify-start"
                    size="sm">
                    Last 30 days
                </Button>
                <Button
                    variant="ghost"
                    className="w-full justify-start"
                    size="sm">
                    This month
                </Button>
                <Button
                    variant="ghost"
                    className="w-full justify-start"
                    size="sm">
                    This year
                </Button>
                <Button
                    variant="ghost"
                    className="w-full justify-start"
                    size="sm">
                    Last year
                </Button>
            </div>
            <Separator orientation="vertical" />
            <Calendar
                mode="single"
                selected={from}
                onSelect={(e: Date) => setDateFilters({ date: { from: e } })}
            />
            <Separator orientation="vertical" />
            <Calendar
                mode="single"
                selected={to}
                onSelect={(e: Date) => setDateFilters({ date: { to: e } })}
            />
        </div>
    );
}*/
