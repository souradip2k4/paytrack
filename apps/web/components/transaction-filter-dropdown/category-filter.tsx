import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { useCategories } from "@/lib/query";
import { useFilterStore } from "@/lib/store";
import { LoaderIcon } from "lucide-react";
import { Checkbox } from "../ui/checkbox";
import { CategoryBadge } from "../category-badge";

export function CategoryFilter({ id }: { id: string }) {
    const { data, isLoading } = useCategories();
    const stack = useFilterStore(s => s.filter_stack);
    const toggle = useFilterStore(s => s.filter_toggle);

    return (
        <Command>
            <CommandInput placeholder="Search..." />
            <CommandList>
                {isLoading && (
                    <CommandGroup forceMount>
                        <CommandItem disabled>
                            <LoaderIcon className="mx-auto animate-spin" />
                        </CommandItem>
                    </CommandGroup>
                )}

                {!isLoading && (
                    <CommandEmpty>No matching options.</CommandEmpty>
                )}

                <CommandGroup>
                    {data?.map((c, i) => {
                        const idx = stack.findIndex(x => x.id === id);
                        const checked =
                            idx >= 0 ?
                                stack[idx].values.findIndex(
                                    x => x.id === c.id,
                                ) >= 0
                                : false;
                        return (
                            <CommandItem
                                key={i}
                                value={c.id}
                                keywords={[c.name]}
                                onSelect={() =>
                                    toggle(
                                        "categories",
                                        "is",
                                        { id: c.id, label: c.name },
                                        id,
                                    )
                                }>
                                <Checkbox aria-disabled checked={checked} />
                                <CategoryBadge category={c.name} />
                            </CommandItem>
                        );
                    })}
                </CommandGroup>
            </CommandList>
        </Command>
    );
}
