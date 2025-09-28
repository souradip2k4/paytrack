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

export function TransactionsTable() {
	const { data, isLoading } = useTransactions();
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

	return (
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
												header.column.columnDef.header,
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
								{/* +1 for amount and +1 for checkbox */}
								{Array.from({
									length: columnVisibleCount + 2,
								}).map((_, j) => (
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
									className="cursor-pointer">
									{row.getVisibleCells().map(cell => (
										<TableCell
											className="not-last:border-r [&:not(:has(>[role='checkbox']))]:hover:bg-accent/10 w-min first:border-none"
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
					:	<TableRow>
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
