import { EntryTable } from "@/components/entry-table";
import { currentUser } from "@clerk/nextjs/server";
import {
    HydrationBoundary,
    QueryClient,
    dehydrate,
} from "@tanstack/react-query";
import axios from "axios";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

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
                <Breadcrumb className="pb-8">
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/">Home</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/components">Components</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                <EntryTable />
            </div>
        </HydrationBoundary>
    );
}
