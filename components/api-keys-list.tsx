"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { ApiKeysResoponse } from "@/lib/api";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { IoClipboardOutline, IoTrashOutline } from "react-icons/io5";
import { Button } from "./ui/button";
import { H3 } from "./ui/typography";

export default function ApiKeysList() {
    const { user } = useUser();
    const queryClient = useQueryClient();
    const apiKeysQuery = useQuery({
        queryKey: ["query", user?.id],
        queryFn: async () => {
            if (!user?.id) return null;
            const res = await axios.get(`/api/users/${user?.id}/api-keys`);
            return res.data as ApiKeysResoponse;
        },
    });

    const apiKeysMutation = useMutation({
        mutationKey: ["query", user?.id, "new"],
        mutationFn: async () => {
            if (!user?.id) return null;
            await axios.post(`/api/api-keys/${user?.id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["query", user?.id] });
            queryClient.refetchQueries({ queryKey: ["query", user?.id] });
        },
    });

    if (apiKeysQuery.isError) return <>{apiKeysQuery.error.message}</>;
    if (apiKeysQuery.isLoading) return <>Loading...</>;
    if (!apiKeysQuery.data) return <>undef</>;

    return (
        <div className="space-y-8">
            <H3 className="mt-0">API Keys</H3>
            <div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead>Permissions</TableHead>
                            <TableHead>Expiry</TableHead>
                            <TableHead></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {apiKeysQuery.data.data.map((key) => (
                            <TableRow key={key.id}>
                                <TableCell className="font-medium">{key.key}</TableCell>
                                <TableCell>{new Date().toDateString()}</TableCell>
                                <TableCell>All</TableCell>
                                <TableCell>No Expiry</TableCell>
                                <TableCell>
                                    <div className="flex gap-2">
                                        <Button size="icon" variant="outline">
                                            <IoClipboardOutline />
                                        </Button>
                                        <Button size="icon" variant="outline">
                                            <IoTrashOutline />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <Button
                onClick={() => {
                    apiKeysMutation.mutate();
                }}
            >
                Create new API Key
            </Button>
        </div>
    );
}
