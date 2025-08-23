import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { useFilterStore } from "@/lib/store";
import { StatusBadge } from "@/components/status-badge";
import { Checkbox } from "../ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Input } from "../ui/input";
import React from "react";
import { Button } from "../ui/button";

export function AmountInput({ id }: { id: string }) {
    const stack = useFilterStore(s => s.filter_stack);
    const toggle = useFilterStore(s => s.filter_toggle);
    const [value, setValue] = React.useState(stack.find(x => x.id === id)?.values[0].label);

    React.useEffect(() => {
        console.log(stack);
    }, [stack]);

    return (
        <div className="p-2 flex gap-2">
            <Input placeholder="Enter amount" className="w-full" value={value} onInput={e => setValue(e.currentTarget.value)} />
            <Button size="sm" onClick={() => toggle("amount", "greater than", { id: "amount", label: value || "0" }, id)}>Apply</Button>
        </div>
    );
}
