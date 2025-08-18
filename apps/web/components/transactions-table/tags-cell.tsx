/*import { type Entry } from "@/app/api/[[...route]]/server";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import { Row } from "@tanstack/react-table";
import axios from "axios";
import { Badge } from "../ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

export const TagsCell = ({ row }: { row: Row<Entry> }) => {
    const tagc = 2; // no of tags to display
    const { user } = useUser();
    const { data } = useQuery<unknown, unknown, Map<string, string>>({
        queryKey: ["tags", "GET", user?.id, "MAP"],
        queryFn: async () => {
            if (!user) {
                return [];
            }
            const res = await axios.get(`/api/users/${user?.id}/tags`);
            const idToNameMap = new Map<string, string>();
            res.data.data.forEach((c: any) => {
                idToNameMap.set(c.id, c.name);
            });
            return idToNameMap;
        },
        enabled: !!user && !!user.id,
    });
    return (
        <div className="flex min-w-[200px] flex-wrap gap-1">
            {row.original.tags.map((tag, i) => {
                if (i + 1 <= tagc) {
                    return (
                        <Badge variant="secondary" key={tag.id}>
                            {data?.get(tag.id)}
                        </Badge>
                    );
                }
            })}
            {row.original.tags.length > tagc && (
                <Popover>
                    <PopoverTrigger asChild>
                        <Badge variant="secondary">
                            +{row.original.tags.length - tagc}
                        </Badge>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px]">
                        <div className="flex flex-wrap gap-1">
                            {row.original.tags.map(tag => {
                                return (
                                    <Badge
                                        variant="secondary"
                                        className="cursor-pointer"
                                        key={tag.id}>
                                        {data?.get(tag.id)}
                                    </Badge>
                                );
                            })}
                        </div>
                    </PopoverContent>
                </Popover>
            )}
        </div>
    );
};*/

export const TagCell = () => <></>
