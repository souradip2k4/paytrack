"use client";

import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";
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
import { useEditorStore } from "@/lib/store/editor-store";
import { cn } from "@/lib/utils";
import {
    ColumnFiltersState,
    SortingState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ArrowDown, ArrowUp, FolderOpen, LoaderCircle } from "lucide-react";
import React from "react";
import { FieldValues, FormProvider, UseFormReturn } from "react-hook-form";
import { columns } from "./columns";

const defaultSpacing: Record<string, number> = {
    select: 48,
    amount: 120,
    name: 480,
    status: 120,
    category_id: 160,
    transaction_date: 180,
    created_at: 150,
    updated_at: 150,
    user_id: 150,
};

export function TransactionsTable({
    formStates,
}: {
    formStates: UseFormReturn<FieldValues, any, FieldValues>;
}) {
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

    const tableParentRef = React.useRef<HTMLFormElement>(null!);

    const virtualizer = useVirtualizer({
        count: rows.length,
        estimateSize: () => 48, // 3 rem
        getScrollElement: () => tableParentRef.current,
        overscan: 20,
    });

    const isEditing = useEditorStore(s => s.is_editing);

    const onSubmit = (e: FieldValues) => {
        console.log(e);
    };

    const columnSpan = table.getAllColumns().filter(column => column.getIsVisible()).length

    return (
        <FormProvider {...formStates}>
            <form
                ref={tableParentRef}
                onSubmit={formStates.handleSubmit(onSubmit)}
                className="border-input max-h-[calc(100vh-10rem)] overflow-auto rounded-md border">
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
                                                header.column.toggleSorting(
                                                    header.column.getIsSorted() ===
                                                    "asc",
                                                )
                                            }
                                            className="hover:bg-accent/10 select-none rounded"
                                            style={{
                                                width: `${header.getSize()}px`,
                                            }}>
                                            <span className="flex items-center gap-2 [&:has(>[role='checkbox'])]:justify-center">
                                                {header.isPlaceholder ? null : (
                                                    flexRender(
                                                        header.column.columnDef
                                                            .header,
                                                        header.getContext(),
                                                    )
                                                )}
                                                {header.column.getIsSorted() ?
                                                    (
                                                        header.column.getIsSorted() ===
                                                        "asc"
                                                    ) ?
                                                        <ArrowUp className="h-4 w-4" />
                                                        : <ArrowDown className="h-4 w-4" />

                                                    : null}
                                            </span>
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody
                        className="w-full"
                        style={{
                            height: `${virtualizer.getTotalSize()}px`,
                            position: "relative",
                        }}>
                        {isTransactionsLoading ?
                            <TableRow>
                                <TableCell colSpan={columnSpan} className="h-[50vh] text-center p-0">
                                    <Empty className="from-muted/50 to-background h-full bg-gradient-to-b from-30%">
                                        <EmptyHeader>
                                            <EmptyMedia variant="icon">
                                                <LoaderCircle className="size-4 animate-spin" />
                                            </EmptyMedia>
                                            <EmptyTitle>Loading...</EmptyTitle>
                                        </EmptyHeader>
                                    </Empty>
                                </TableCell>
                            </TableRow>
                            : (
                                rows?.length &&
                                virtualizer.getVirtualItems()?.length
                            ) ?
                                virtualizer.getVirtualItems().map(virtualRow => {
                                    const row = rows[virtualRow.index];
                                    return (
                                        <TableRow
                                            key={row.id}
                                            data-state={
                                                row.getIsSelected() && "selected"
                                            }
                                            style={{
                                                position: "absolute",
                                                top: 0,
                                                left: 0,
                                                width: "100%",
                                                height: `${virtualRow.size}px`,
                                                transform: `translateY(${virtualRow.start}px)`,
                                            }}
                                            className="flex cursor-pointer">
                                            {row.getVisibleCells().map(cell => (
                                                <TableCell
                                                    className={cn(
                                                        "not-last:border-r hover:bg-accent/10 flex items-center has-[&[data-editor='stale']]:bg-amber-500/10 [&:has(>[role='checkbox'])]:justify-center",
                                                        {
                                                            "p-0 has-[&[data-editor='disabled']]:p-2":
                                                                isEditing,
                                                        },
                                                    )}
                                                    key={cell.id}
                                                    style={{
                                                        width: `${cell.column.getSize()}px`,
                                                        height: `${virtualRow.size}px`,
                                                    }}>
                                                    {flexRender(
                                                        cell.column.columnDef.cell,
                                                        cell.getContext(),
                                                    )}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    );
                                })
                                :
                                <TableRow>
                                    <TableCell colSpan={columnSpan} className="h-[50vh] text-center p-0">
                                        <Empty className="from-muted/50 to-background h-full bg-gradient-to-b from-30%">
                                            <EmptyHeader>
                                                <EmptyMedia variant="icon">
                                                    <FolderOpen className="size-4" />
                                                </EmptyMedia>
                                                <EmptyTitle>
                                                    No transcations found
                                                </EmptyTitle>
                                                <EmptyDescription>
                                                    Click {`"New transaction"`} to add
                                                    one.
                                                    <br />
                                                    {/*You can also import from a csv or
                                            excel file*/}
                                                </EmptyDescription>
                                            </EmptyHeader>
                                        </Empty>
                                    </TableCell>
                                </TableRow>
                        }
                    </TableBody>
                </Table>
            </form>
        </FormProvider>
    );
}
