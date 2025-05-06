"use client";

import { type Entry } from "@/app/api/[[...route]]/server";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Row } from "@tanstack/react-table";
import axios from "axios";
import { Ellipsis } from "lucide-react";
import { toast } from "sonner";

export const EditCell = ({ row }: { row: Row<Entry> }) => {
    const queryClient = useQueryClient();

    const deleteEntryMutation = useMutation({
        mutationKey: ["entries", "DELETE"],
        mutationFn: async () => {
            const id = row.original.id;
            await axios.delete(`/api/entries/${id}`);
            return id;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["entries", "GET"],
                exact: false,
            });
            queryClient.refetchQueries({
                queryKey: ["entries", "GET"],
                exact: false,
            });
            toast.success("Entry deleted successfully.");
        },
    });

    /*const editEntryMutation = useMutation({
        mutationKey: ["entries", "PUT"],
        mutationFn: async data => {
            const { id } = data;
            const res = await axios.put(`/api/entries/${id}`, data);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["entries", "GET"],
                exact: false,
            });
            queryClient.refetchQueries({
                queryKey: ["entries", "GET"],
                exact: false,
            });
        },
    });*/

    return (
        <div className="text-right">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <Ellipsis className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem
                        variant="destructive"
                        onClick={() => deleteEntryMutation.mutate()}>
                        Delete entry
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
};
