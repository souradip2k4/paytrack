"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { authClient } from "@/lib/auth-client";
import { bearerHeader } from "@/lib/bearer";
import { db } from "@/lib/db";
import { useFilterStore, useStore } from "@/lib/store";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    ColumnFiltersState,
    SortingState,
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
import { EditSheet } from "./edit-sheet";
import { useTransactions } from "@/lib/query";

export function TransactionsTable() {

    const { data, isLoading } = useTransactions();
    const transactions = React.useMemo(() => data || [], [data]);

    const columnVisibility = useFilterStore(s => s.display_visibility_state);
    const rowSelection = useFilterStore(s => s.display_row_selection_state);
    const setColumnVisibility = useFilterStore(
        s => s.set_display_visibility_state,
    );
    const setRowSelection = useFilterStore(
        s => s.set_display_row_selection_state,
    );

    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] =
        React.useState<ColumnFiltersState>([]);
    const [isSheetOpen, setIsSheetOpen] = React.useState(false);
    const [selectedTransaction, setSelectedTransaction] = React.useState(null);

    const handleRowClick = (row: any) => {
        setSelectedTransaction(row.original);
        setIsSheetOpen(true);
    };

    const table = useReactTable({
        data: transactions,
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
    });

    return (
        <>
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
                        {isLoading ?
                            Array.from({ length: 30 }).map((_, i) => (
                                <TableRow key={`skeleton-${i}`}>
                                    {columns.map((column, j) => (
                                        <TableCell
                                            key={`skeleton-cell-${j}`}
                                            className="not-last:border-r first:border-none">
                                            <Skeleton className="my-2 h-4 w-full" />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                            : table.getRowModel().rows?.length ?
                                table.getRowModel().rows.map(row => {
                                    return (
                                        <TableRow
                                            key={row.id}
                                            data-state={
                                                row.getIsSelected() && "selected"
                                            }
                                            onClick={() => handleRowClick(row)}
                                            className="cursor-pointer">
                                            {row.getVisibleCells().map(cell => (
                                                <TableCell
                                                    className="not-last:border-r first:border-none"
                                                    key={cell.id}>
                                                    {flexRender(
                                                        cell.column.columnDef.cell,
                                                        cell.getContext(),
                                                    )}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    );
                                })
                                : <TableRow>
                                    <TableCell
                                        colSpan={columns.length}
                                        className="space-y-4 py-16 text-center">
                                        <h1 className="text-lg">
                                            No transactions
                                        </h1>
                                        <p className="text-muted-foreground mb-4 text-balance">
                                            Click {`"New transaction"`} to add
                                            one.
                                            <br />
                                            You can also import from a csv or
                                            excel file
                                            {"."}
                                        </p>
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
            {selectedTransaction && (
                <EditSheet
                    open={isSheetOpen}
                    onOpenChange={setIsSheetOpen}
                    transaction={selectedTransaction}
                />
            )}
        </>
    );
}
