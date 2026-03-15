"use client";

import { Checkbox } from "@budgetbee/ui/core/checkbox";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@budgetbee/ui/core/empty";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@budgetbee/ui/core/table";

import { useTransactions } from "@/lib/query";
import { useDisplayStore, useStore } from "@/lib/store";
import { cn } from "@budgetbee/ui/lib/utils";
import {
	ColumnDef,
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
import {
	EditableAmountCell,
	EditableCategoryCell,
	EditableStatusCell,
	EditableTitleCell,
	EditableTransactionDateCell,
	ReadonlyCreatorCell,
	ReadonlyDateCell,
} from "./editable-cells";

const columns: ColumnDef<any>[] = [
	{
		id: "select",
		header: ({ table }) => (
			<Checkbox
				checked={
					table.getIsAllPageRowsSelected() ||
					(table.getIsSomePageRowsSelected() && "indeterminate")
				}
				onCheckedChange={value =>
					table.toggleAllPageRowsSelected(!!value)
				}
				aria-label="Select all"
			/>
		),
		cell: ({ row }) => (
			<Checkbox
				checked={row.getIsSelected()}
				onCheckedChange={value => row.toggleSelected(!!value)}
				aria-label="Select row"
			/>
		),
		size: 48,
		enableSorting: false,
		enableHiding: false,
	},
	{
		accessorKey: "amount",
		header: "Amount",
		cell: EditableAmountCell,
		size: 120,
		enableHiding: false,
	},
	{
		accessorKey: "name",
		header: "Title",
		cell: EditableTitleCell,
		size: 480,
	},
	{
		accessorKey: "status",
		header: "Status",
		cell: EditableStatusCell,
		size: 120,
	},
	{
		accessorKey: "category_id",
		header: "Category",
		cell: EditableCategoryCell,
		size: 160,
	},
	{
		accessorKey: "transaction_date",
		header: "Transaction date",
		cell: EditableTransactionDateCell,
		sortingFn: "datetime",
		size: 180,
	},
	{
		accessorKey: "created_at",
		header: "Created",
		cell: ReadonlyDateCell,
		sortingFn: "datetime",
		size: 150,
	},
	{
		accessorKey: "updated_at",
		header: "Last updated",
		cell: ReadonlyDateCell,
		sortingFn: "datetime",
		size: 150,
	},
	{
		accessorKey: "user_id",
		header: "Creator",
		cell: ReadonlyCreatorCell,
		sortingFn: "datetime",
		size: 250,
	},
];

export function TransactionsTableV2() {
	const { data, isLoading } = useTransactions();
	const transactions = React.useMemo(() => data || [], [data]);

	const scrollRef = React.useRef<HTMLDivElement>(null!);

	const columnVisibility = useDisplayStore(s => s.display_visibility_state);
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

	// Sync selected row IDs to global store
	React.useEffect(() => {
		useStore.setState({
			row_selection_entries_ids: table
				.getPreFilteredRowModel()
				.flatRows.filter(x => rowSelection[x.id])
				.map(x => x.original.id),
		});
	});

	const { rows } = table.getRowModel();

	const virtualizer = useVirtualizer({
		count: rows.length,
		estimateSize: () => 40,
		getScrollElement: () => scrollRef.current,
		overscan: 20,
	});

	const columnSpan = table
		.getAllColumns()
		.filter(column => column.getIsVisible()).length;

	return (
		<div ref={scrollRef} className="max-h-[calc(100vh-6rem)] overflow-auto">
			<Table>
				<TableHeader className="bg-card sticky top-0 z-10">
					{table.getHeaderGroups().map(headerGroup => (
						<TableRow key={headerGroup.id}>
							{headerGroup.headers.map(header => (
								<TableHead
									key={header.id}
									onClick={() =>
										header.column.getCanSort() &&
										header.column.toggleSorting(
											header.column.getIsSorted() ===
												"asc",
										)
									}
									className={cn(
										"select-none",
										header.column.getCanSort() &&
											"hover:bg-accent/50 cursor-pointer",
									)}
									style={{
										width: `${header.getSize()}px`,
										minWidth: `${header.getSize()}px`,
										maxWidth: `${header.getSize()}px`,
									}}>
									<span className="flex gap-2 border-r-red-500 [&:has(>[role='checkbox'])]:justify-center">
										{header.isPlaceholder ? null : (
											flexRender(
												header.column.columnDef.header,
												header.getContext(),
											)
										)}
										{header.column.getIsSorted() ?
											(
												header.column.getIsSorted() ===
												"asc"
											) ?
												<ArrowUp className="h-4 w-4" />
											:	<ArrowDown className="h-4 w-4" />
										:	null}
									</span>
								</TableHead>
							))}
						</TableRow>
					))}
				</TableHeader>
				<TableBody
					style={{
						height: `${virtualizer.getTotalSize()}px`,
						position: "relative",
					}}>
					{isLoading ?
						<TableRow>
							<TableCell
								colSpan={columnSpan}
								className="h-[50vh] p-0 text-center">
								<Empty className="from-muted/50 to-background bg-linear-to-b h-full from-30%">
									<EmptyHeader>
										<EmptyMedia variant="icon">
											<LoaderCircle className="size-4 animate-spin" />
										</EmptyMedia>
										<EmptyTitle>Loading...</EmptyTitle>
									</EmptyHeader>
								</Empty>
							</TableCell>
						</TableRow>
					: rows?.length && virtualizer.getVirtualItems()?.length ?
						virtualizer.getVirtualItems().map(virtualRow => {
							const row = rows[virtualRow.index];
							if (!row) return null;
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
									className="flex">
									{row.getVisibleCells().map(cell => (
										<TableCell
											key={cell.id}
											className={cn(
												"not-last:border-r flex items-center p-0 px-2 [&:has(>[role='checkbox'])]:justify-center",
											)}
											style={{
												width: `${cell.column.getSize()}px`,
												minWidth: `${cell.column.getSize()}px`,
												maxWidth: `${cell.column.getSize()}px`,
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
					:	<TableRow>
							<TableCell
								colSpan={columnSpan}
								className="h-[50vh] p-0 text-center">
								<Empty className="from-muted/50 to-background h-full bg-gradient-to-b from-30%">
									<EmptyHeader>
										<EmptyMedia variant="icon">
											<FolderOpen className="size-4" />
										</EmptyMedia>
										<EmptyTitle>
											No transactions found
										</EmptyTitle>
										<EmptyDescription>
											Click {`"New transaction"`} to add
											one.
										</EmptyDescription>
									</EmptyHeader>
								</Empty>
							</TableCell>
						</TableRow>
					}
				</TableBody>
			</Table>
		</div>
	);
}
