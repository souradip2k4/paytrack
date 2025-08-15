"use client";

import { Entry } from "@/app/api/[[...route]]/server";
import { Button } from "@/components/ui/button";
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { QueryEntry } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import { db } from "@/lib/db";
import { useFilterStore, useStore } from "@/lib/store";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    ColumnDef,
    ColumnFiltersState,
    Row,
    RowSelectionState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import axios from "axios";
import React from "react";
import { toast } from "sonner";
import { columns } from "./columns";
import { DeleteButton } from "./delete-button";

type FilterState = {
    page: number;
    page_size: number;
};

export function EntriesTable() {
    const authData = authClient.useSession();

    // @ts-ignore
    const [pagination, setPaginantion] = React.useState<FilterState>({
        page: 1,
        page_size: 10,
    });

    const filter_stack = useFilterStore(s => s.filter_stack);
    const applyFilter = useFilterStore(s => s.apply_filter);

    const { data, isLoading, isError, error } = useQuery<any>({
        queryKey: ["tr", "get", filter_stack],
        queryFn: async () => {
            if (!authData?.data?.user) return null;
            const res = await applyFilter(db
                .from("transactions")
                .select("*")
                .order("transaction_date", {
                    ascending: false,
                }));

            console.log(res.data);
            if (res.error) {
                toast.error("Failed to fetch transactions");
                return null;
            }
            console.log(res.data);
            return {
                page: 1,
                page_size: 10,
                total: res.data.length,
                has_prev: false,
                has_next: false,
                data: res.data,
            };
        },
        enabled: !!authData?.data?.user,
    });

    const tableData = React.useMemo(() => {
        if (isLoading) return Array(pagination.page_size || 10).fill({});
        if (!data || !data?.data) return [];
        return data.data;
    }, [isLoading, data, pagination.page_size]);

    const tableColumns = React.useMemo(
        () =>
            isLoading ?
                columns.map(c => ({
                    ...c,
                    cell: () => <Skeleton className="my-2 h-4 w-full" />,
                }))
                : columns,
        [isLoading],
    );

    return (
        <React.Fragment>
            <DataTable
                data={tableData}
                columns={tableColumns}
                pagination={{
                    page: data?.page ?? 1,
                    page_size: data?.page_size ?? 10,
                    total: data?.total ?? 0,
                    has_prev: data?.has_prev ?? false,
                    has_next: data?.has_next ?? false,
                }}
            />
            {/*<div className="flex items-center justify-end space-x-2 py-4">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                        setPaginantion({ page: pagination.page - 1 })
                    }
                    disabled={!data?.has_prev}>
                    Previous
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                        setPaginantion({ page: pagination.page + 1 })
                    }
                    disabled={!data?.has_next}>
                    Next
                </Button>
            </div>*/}
        </React.Fragment>
    );
}

interface DataTableProps<TData> {
    columns: ColumnDef<TData>[];
    data: TData[];
    pagination: {
        page: number;
        page_size: number;
        total: number;
        has_prev: boolean;
        has_next: boolean;
    };
}

export function DataTable(props: DataTableProps<Entry>) {
    const { columns, data, pagination } = props;

    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] =
        React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState<RowSelectionState>(
        {},
    );

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
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
        manualPagination: true,
        rowCount: pagination.total,
        pageCount: pagination.page,
    });

    const queryClient = useQueryClient();

    const deleteEntriesMutation = useMutation<
        unknown,
        unknown,
        {
            ids: string[];
        }
    >({
        mutationFn: async data => {
            const res = await axios.delete("/api/entries", {
                data,
            });
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
            toast.success("Entries deleted successfully.");
        },
    });

    const deleteColumns = () => {
        const filtered_data = data
            .filter((_value, index) => rowSelection[index] === true)
            .map((x: any) => x.id);
        deleteEntriesMutation.mutate({
            ids: filtered_data,
        });
        setRowSelection({}); // reset selection
    };

    return (
        <div>
            {/*<div className="flex items-center gap-2 pb-4 max-sm:flex-wrap">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="outline"
                            size="icon"
                            className="ml-auto">
                            <EyeOff className="size-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {table
                            .getAllColumns()
                            .filter(column => column.getCanHide())
                            .map(column => {
                                return (
                                    <DropdownMenuCheckboxItem
                                        key={column.id}
                                        className="capitalize"
                                        checked={column.getIsVisible()}
                                        onCheckedChange={value =>
                                            column.toggleVisibility(!!value)
                                        }>
                                        {column.id}
                                    </DropdownMenuCheckboxItem>
                                );
                            })}
                    </DropdownMenuContent>
                </DropdownMenu>
                <FilterEntriesButton />
                {(table.getIsAllPageRowsSelected() ||
                    table.getIsSomePageRowsSelected()) && (
                        <Button
                            size="icon"
                            variant="destructive"
                            onClick={() => deleteColumns()}>
                            <Trash2 className="size-4" />
                        </Button>
                    )}
                <div className="inline-flex">
                    <LogEntriesButton>
                        <Button className="border-primary-foreground/20 rounded-r-none border-r">
                            Log entries
                        </Button>
                    </LogEntriesButton>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button size="icon" className="rounded-l-none">
                                <ChevronDown />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem asChild>
                                <CreateCategoryButton>
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start">
                                        Create category
                                    </Button>
                                </CreateCategoryButton>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <CreateTagButton>
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start">
                                        Create tag
                                    </Button>
                                </CreateTagButton>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>*/}
            <div className="border-input rounded-md border">
                <Table>
                    <TableHeader className="bg-muted">
                        {table.getHeaderGroups().map(headerGroup => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map(header => {
                                    return (
                                        <TableHead
                                            key={header.id}
                                            className="not-last:border-r first:border-none">
                                            {header.isPlaceholder ? null : (
                                                flexRender(
                                                    header.column.columnDef
                                                        .header,
                                                    header.getContext(),
                                                )
                                            )}
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ?
                            table.getRowModel().rows.map(row => {
                                return (
                                    <ContextMenu key={row.id}>
                                        <ContextMenuTrigger asChild>
                                            <TableRow
                                                data-state={
                                                    row.getIsSelected() &&
                                                    "selected"
                                                }>
                                                {row
                                                    .getVisibleCells()
                                                    .map(cell => (
                                                        <TableCell
                                                            className="not-last:border-r first:border-none"
                                                            key={cell.id}>
                                                            {flexRender(
                                                                cell.column
                                                                    .columnDef
                                                                    .cell,
                                                                cell.getContext(),
                                                            )}
                                                        </TableCell>
                                                    ))}
                                            </TableRow>
                                        </ContextMenuTrigger>
                                        <ContextMenuContent>
                                            <ContextMenuItem asChild>
                                                <DeleteButton
                                                    row={row as Row<QueryEntry>}
                                                />
                                            </ContextMenuItem>
                                        </ContextMenuContent>
                                    </ContextMenu>
                                );
                            })
                            : <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="py-16 text-center">
                                    <img
                                        src="/images/nothing.png"
                                        alt="No transactions"
                                        className="mx-auto mb-4 w-1/12"
                                    />
                                    <h1 className="text-lg">No transactions</h1>
                                    <p className="text-muted-foreground mb-4 text-balance">{`Click "New transaction" to add one. You can also import from a csv or excel file.`}</p>
                                    <div className="flex items-center justify-center gap-2">
                                        <Button
                                            onClick={() =>
                                                useStore.setState({
                                                    popover_transaction_dialog_open: true,
                                                })
                                            }>
                                            Add transaction
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        }
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
