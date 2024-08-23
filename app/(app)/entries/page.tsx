import { EntryTable } from "@/components/entry-table";
import { currentUser } from "@clerk/nextjs/server";
import {
    HydrationBoundary,
    QueryClient,
    dehydrate,
} from "@tanstack/react-query";
import axios from "axios";

export default async function Page() {
    const user = await currentUser();
    const queryClient = new QueryClient();
    await queryClient.prefetchQuery({
        queryKey: ["entries", user?.id],
        queryFn: async () => {
            const res = await axios.get(`/api/users/${user?.id}/entries`);
            return res.data;
        },
    });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <div className="px-8 pt-8">
                <EntryTable />
            </div>
        </HydrationBoundary>
    );
}
