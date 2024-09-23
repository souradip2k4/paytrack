"use client";


import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
} from "@/components/ui/context-menu"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { QueryCategories } from "@/lib/api";
import { deleteEntriesMutationFn } from "@/lib/query";
import { cn } from "@/lib/utils";
import { categoriesAtom, isEditingAtom } from "@/store/atoms";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    ColumnDef,
    ColumnFiltersState,
    RowSelectionState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import axios from "axios";
import { useEffect, useState } from "react";
import { FaRegEyeSlash } from "react-icons/fa";
import { IoTrashOutline } from "react-icons/io5";
import { useRecoilState, useSetRecoilState } from "recoil";
import { CreateEntryDialog } from "../create-entry-dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
}

export function DataTable<TData, TValue>({
    columns,
    data,
}: DataTableProps<TData, TValue>) {
    const { user } = useUser();
    const [isEditing, setEditing] = useRecoilState(isEditingAtom);
    const toggleEditingMode = () => {
        setEditing((x) => !x);
        setColumnVisibility((value) => {
            return { ...value, select: !isEditing };
        });
    };

    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        state: {
            sorting,
            columnVisibility,
            rowSelection,
            columnFilters,
        },
    });

    const queryClient = useQueryClient();
    const deleteEntriesMutation = useMutation({
        mutationFn: deleteEntriesMutationFn,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["entries"] });
            queryClient.refetchQueries({ queryKey: ["entries"] });
        },
    });

    const deleteColumns = () => {
        const filtered_data = data.filter(
            (_value, index) => rowSelection[index] === true,
        );
        deleteEntriesMutation.mutate(filtered_data);
        setRowSelection({}); // reset selection
    };

    const categoriesQuery = useQuery<unknown, unknown, QueryCategories>({
        queryKey: ["category"],
        queryFn: async () => {
            if (!user?.id) return [] as QueryCategories;
            const res = await axios.get(`/api/users/${user?.id}/categories`);
            console.log(res.data)
            return res.data as QueryCategories;
        },
    });

    const setCategories = useSetRecoilState(categoriesAtom);
    useEffect(() => setCategories(categoriesQuery.data))

    return (
        <div>
            <div className="flex items-center gap-4 pb-4">
                <Input
                    placeholder="Filter messages..."
                    value={(table.getColumn("message")?.getFilterValue() as string) ?? ""}
                    onChange={(event) =>
                        table.getColumn("message")?.setFilterValue(event.target.value)
                    }
                    className="max-w-sm"
                />
                {isEditing && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="ml-auto">
                                <FaRegEyeSlash className="h-4 w-4 mr-2" /> Hide
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {table
                                .getAllColumns()
                                .filter((column) => column.getCanHide())
                                .map((column) => {
                                    return (
                                        <DropdownMenuCheckboxItem
                                            key={column.id}
                                            className="capitalize"
                                            checked={column.getIsVisible()}
                                            onCheckedChange={(value) =>
                                                column.toggleVisibility(!!value)
                                            }
                                        >
                                            {column.id}
                                        </DropdownMenuCheckboxItem>
                                    );
                                })}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
                {isEditing && (
                    <Button
                        variant="outline"
                        size="icon"
                        className=""
                        onClick={deleteColumns}
                    >
                        <IoTrashOutline className="h-4 w-4" />
                    </Button>
                )}
                <Button
                    variant="outline"
                    className={cn(!isEditing ? "ml-auto" : "")}
                    onClick={toggleEditingMode}
                >
                    {isEditing ? "View" : "Edit"}
                </Button>
                <CreateEntryDialog />
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext(),
                                                )}
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext(),
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-end space-x-2 py-4">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                >
                    Previous
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                >
                    Next
                </Button>
            </div>
        </div>
    );
}
