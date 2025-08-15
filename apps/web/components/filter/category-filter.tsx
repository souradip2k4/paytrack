import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command";
import { db } from "@/lib/db";
import { useFilterStore, useStore } from "@/lib/store";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Checkbox } from "../ui/checkbox";
import { wait } from "@/lib/utils";
import { LoaderIcon } from "lucide-react";

export function CategoryFilter({ id }: { id: string }) {
    const { data, isLoading } = useQuery({
        queryKey: ["cat", "get"],
        queryFn: async () => {
            const res = await db.from("categories").select("*").order("name");
            if (res.error) {
                toast.error("Failed to get categories");
                return;
            }
            console.log(res.data);
            return res.data;
        },
    });

    const stack = useFilterStore(s => s.filter_stack);
    const toggle = useFilterStore(s => s.filter_toggle);

    return (
        <Command>
            <CommandInput placeholder="Search..." />
            <CommandList>
                {isLoading && (
                    <CommandGroup forceMount>
                        <CommandItem disabled><LoaderIcon className="animate-spin mx-auto" /></CommandItem>
                    </CommandGroup>
                )}

                {!isLoading && <CommandEmpty>No matching options.</CommandEmpty>}

                <CommandGroup>
                    {data?.map((c, i) => {
                        const idx = stack.findIndex(x => x.id === id);
                        const checked = idx >= 0 ? (stack[idx].values.findIndex(x => x.id === c.id) >= 0) : false;
                        return (
                            <CommandItem
                                key={i}
                                value={c.id}
                                keywords={[c.name]}
                                onSelect={() => toggle("categories", "is", { id: c.id, label: c.name }, id)}
                            >
                                <Checkbox aria-disabled checked={checked} />
                                {c.name}
                            </CommandItem>
                        )
                    })}
                </CommandGroup>
            </CommandList>
        </Command>
    );
}
