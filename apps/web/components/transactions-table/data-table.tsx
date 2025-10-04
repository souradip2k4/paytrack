"use client";

import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useTransactions } from "@/lib/query";
import { useDisplayStore, useStore } from "@/lib/store";
import {
    ColumnFiltersState,
    SortingState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import React from "react";
import { columns } from "./columns";
import { useVirtualizer } from "@tanstack/react-virtual"
import { ArrowDown, ArrowUp } from "lucide-react";

export function TransactionsTable() {
    const { data, isLoading: isTransactionsLoading } = useTransactions();
    const transactions = React.useMemo(() => data || [], [data]);

    const columnVisibility = useDisplayStore(s => s.display_visibility_state);
    const columnVisibleCount = Object.keys(columnVisibility).reduce(
        (count, key) => {
            if (columnVisibility[key] === true) return count + 1;
            return count;
        },
        0,
    );

    const rowSelection = useDisplayStore(s => s.display_row_selection_state);
    const setColumnVisibility = useDisplayStore(
        s => s.set_display_visibility_state,
    );
    const setRowSelection = useDisplayStore(
        s => s.set_display_row_selection_state,
    );

    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] =
        React.useState<ColumnFiltersState>([]);

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

    React.useEffect(() => {
        useStore.setState({
            row_selection_entries_ids: table
                .getPreFilteredRowModel()
                .flatRows.filter(x => rowSelection[x.id])
                .map(x => x.original.id),
        });
    });

    const { rows } = table.getRowModel();

    const tableParentRef = React.useRef<HTMLDivElement>(null!);

    const virtualizer = useVirtualizer({
        count: rows.length,
        estimateSize: () => 48, // 3 rem
        getScrollElement: () => tableParentRef.current,
        overscan: 20,
    })

    return (
        <div ref={tableParentRef} className="border-input rounded-md border max-h-[calc(100vh-10rem)] overflow-auto">
            <Table>
                <TableHeader className="bg-muted sticky top-px z-10 flex">
                    {table.getHeaderGroups().map(headerGroup => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map(header => {
                                return (
                                    <TableHead
                                        key={header.id}
                                        onClick={() =>
                                            header.column.getCanSort() &&
                                            header.column.toggleSorting(header.column.getIsSorted() === "asc")
                                        }
                                        className="select-none hover:bg-accent/10 rounded"
                                        style={{ width: `${header.getSize()}px` }}
                                    >
                                        <span className="flex items-center [&:has(>[role='checkbox'])]:justify-center gap-2">
                                            {header.isPlaceholder ? null : (
                                                flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext(),
                                                )
                                            )}
                                            {header.column.getIsSorted() ? header.column.getIsSorted() === "asc" ?
                                                <ArrowUp className="h-4 w-4" />
                                                : <ArrowDown className="h-4 w-4" /> : null}
                                        </span>
                                    </TableHead>
                                );
                            })}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody className="w-full" style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}>
                    {isTransactionsLoading ?
                        Array.from({ length: 30 }).map((_, i) => (
                            <TableRow key={`skeleton-${i}`}>
                                {/* +1 for amount and +1 for checkbox */}
                                {Array.from({
                                    length: columnVisibleCount + 2,
                                }).map((_, j) => (
                                    <TableCell
                                        key={`skeleton-cell-${j}`}
                                        className="not-last:border-r">
                                        <Skeleton className="my-2 h-4 w-full" />
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                        : rows?.length && virtualizer.getVirtualItems()?.length ?
                            virtualizer.getVirtualItems().map((virtualRow) => {
                                const row = rows[virtualRow.index];
                                return (
                                    <TableRow
                                        key={row.id}
                                        data-state={
                                            row.getIsSelected() && "selected"
                                        }
                                        style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            width: '100%',
                                            height: `${virtualRow.size}px`,
                                            transform: `translateY(${virtualRow.start}px)`
                                        }}
                                        className="cursor-pointer flex">
                                        {row.getVisibleCells().map(cell => (
                                            <TableCell
                                                // [&:not(:has(>[role='checkbox']))]:hover:bg-accent/10
                                                className="not-last:border-r hover:bg-accent/10 flex items-center [&:has(>[role='checkbox'])]:justify-center"
                                                key={cell.id}
                                                style={{ width: `${cell.column.getSize()}px`, height: `${virtualRow.size}px` }}
                                            >
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
                                    <h1 className="text-lg">No transactions</h1>
                                    <p className="text-muted-foreground mb-4 text-balance">
                                        Click {`"New transaction"`} to add one.
                                        <br />
                                        You can also import from a csv or excel file
                                        {"."}
                                    </p>
                                </TableCell>
                            </TableRow>
                    }
                </TableBody>
            </Table>
        </div>
    );
}
