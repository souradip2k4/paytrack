"use client";

import { Checkbox } from "@budgetbee/ui/core/checkbox";
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuSeparator,
	ContextMenuTrigger,
} from "@budgetbee/ui/core/context-menu";
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

import {
	useCategoryMap,
	useTransactionMutation,
	useTransactions,
} from "@/lib/query";
import { useDisplayStore, useStore } from "@/lib/store";
import { cn } from "@budgetbee/ui/lib/utils";
import {
	Cell,
	ColumnDef,
	ColumnFiltersState,
	ColumnPinningState,
	GroupingState,
	Row,
	SortingState,
	flexRender,
	getCoreRowModel,
	getExpandedRowModel,
	getFilteredRowModel,
	getGroupedRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
	ArrowDown,
	ArrowUp,
	ChevronDown,
	ChevronRight,
	ClipboardCopy,
	FolderOpen,
	LoaderCircle,
	Plus,
	Trash2,
} from "lucide-react";
import React from "react";
import { toast } from "sonner";
import { ColumnHeaderMenu } from "./column-header-menu";
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
		minSize: 48,
		enableSorting: false,
		enableHiding: false,
		enableGrouping: false,
		enableResizing: false,
	},
	{
		accessorKey: "amount",
		header: "Amount",
		cell: EditableAmountCell,
		size: 120,
		minSize: 80,
		enableHiding: false,
		aggregatedCell: ({ getValue }) => {
			const sum = getValue<number>();
			return (
				<span className="text-muted-foreground px-2 text-sm font-medium">
					Sum: {sum?.toFixed(2) ?? "—"}
				</span>
			);
		},
		aggregationFn: "sum",
	},
	{
		accessorKey: "name",
		header: "Title",
		cell: EditableTitleCell,
		size: 480,
		minSize: 120,
		aggregatedCell: () => null,
	},
	{
		accessorKey: "status",
		header: "Status",
		cell: EditableStatusCell,
		size: 120,
		minSize: 80,
		aggregatedCell: ({ row }) => (
			<span className="text-muted-foreground px-2 text-sm">
				{row.subRows.length} items
			</span>
		),
	},
	{
		accessorKey: "category_id",
		header: "Category",
		cell: EditableCategoryCell,
		size: 160,
		minSize: 100,
		aggregatedCell: ({ row }) => (
			<span className="text-muted-foreground px-2 text-sm">
				{row.subRows.length} items
			</span>
		),
	},
	{
		accessorKey: "transaction_date",
		header: "Transaction date",
		cell: EditableTransactionDateCell,
		sortingFn: "datetime",
		size: 180,
		minSize: 120,
		getGroupingValue: (row: any) =>
			row.transaction_date ?
				new Date(row.transaction_date).toISOString().slice(0, 10)
			:	"",
		aggregatedCell: () => null,
	},
	{
		accessorKey: "created_at",
		header: "Created",
		cell: ReadonlyDateCell,
		sortingFn: "datetime",
		size: 150,
		minSize: 100,
		getGroupingValue: (row: any) =>
			row.created_at ?
				new Date(row.created_at).toISOString().slice(0, 10)
			:	"",
		aggregatedCell: () => null,
	},
	{
		accessorKey: "updated_at",
		header: "Last updated",
		cell: ReadonlyDateCell,
		sortingFn: "datetime",
		size: 150,
		minSize: 100,
		getGroupingValue: (row: any) =>
			row.updated_at ?
				new Date(row.updated_at).toISOString().slice(0, 10)
			:	"",
		aggregatedCell: () => null,
	},
	{
		accessorKey: "user_id",
		header: "Creator",
		cell: ReadonlyCreatorCell,
		sortingFn: "datetime",
		size: 250,
		minSize: 120,
		aggregatedCell: () => null,
	},
];

function getCommonPinningStyles(column: {
	getIsPinned: () => false | "left" | "right";
	getStart: (pos?: "left" | "right") => number;
	getAfter: (pos?: "left" | "right") => number;
}): React.CSSProperties {
	const pinned = column.getIsPinned();
	if (!pinned) return {};
	return {
		position: "sticky",
		left: pinned === "left" ? `${column.getStart("left")}px` : undefined,
		right: pinned === "right" ? `${column.getAfter("right")}px` : undefined,
		zIndex: 1,
	};
}

function getCellDisplayValue(
	cell: Cell<any, unknown>,
	categoryMap: Map<string, any>,
): string {
	const columnId = cell.column.id;
	const value = cell.getValue();

	if (columnId === "category_id") {
		const cat = categoryMap.get(value as string);
		return cat?.name ?? "";
	}

	if (value instanceof Date) return value.toISOString();
	if (value == null) return "";
	return String(value);
}

function CellContextMenu({
	cell,
	row,
	children,
}: {
	cell: Cell<any, unknown>;
	row: Row<any>;
	children: React.ReactNode;
}) {
	const categoryMap = useCategoryMap();
	const { mutate } = useTransactionMutation();

	const handleCopy = () => {
		const text = getCellDisplayValue(cell, categoryMap);
		navigator.clipboard.writeText(text);
		toast.success("Copied to clipboard");
	};

	const handleInsert = (position: "above" | "below") => {
		const currentDate = row.original.transaction_date;
		mutate({
			type: "create",
			payload: {
				amount: 0,
				status: "paid",
				name: "",
				transaction_date: currentDate ?? new Date().toISOString(),
			},
		});
		toast.success(`Row added ${position}`);
	};

	const handleDelete = () => {
		mutate({
			type: "delete",
			payload: { id: row.original.id },
		});
		toast.success("Transaction deleted");
	};

	return (
		<ContextMenu>
			<ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
			<ContextMenuContent>
				<ContextMenuItem onClick={handleCopy}>
					<ClipboardCopy />
					Copy value
				</ContextMenuItem>
				<ContextMenuSeparator />
				<ContextMenuItem onClick={() => handleInsert("above")}>
					<Plus />
					Insert row above
				</ContextMenuItem>
				<ContextMenuItem onClick={() => handleInsert("below")}>
					<Plus />
					Insert row below
				</ContextMenuItem>
				<ContextMenuSeparator />
				<ContextMenuItem variant="destructive" onClick={handleDelete}>
					<Trash2 />
					Delete row
				</ContextMenuItem>
			</ContextMenuContent>
		</ContextMenu>
	);
}

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
	const [grouping, setGrouping] = React.useState<GroupingState>([]);
	const [columnPinning, setColumnPinning] =
		React.useState<ColumnPinningState>({ left: ["select"], right: [] });

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
		onGroupingChange: setGrouping,
		getGroupedRowModel: getGroupedRowModel(),
		getExpandedRowModel: getExpandedRowModel(),
		onColumnPinningChange: setColumnPinning,
		columnResizeMode: "onChange",
		state: {
			sorting,
			columnVisibility,
			rowSelection,
			columnFilters,
			grouping,
			columnPinning,
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

	const columnSizeVars = React.useMemo(() => {
		const headers = table.getFlatHeaders();
		const vars: Record<string, string> = {};
		for (const header of headers) {
			vars[`--header-${header.id}-size`] = `${header.getSize()}px`;
			vars[`--col-${header.column.id}-size`] =
				`${header.column.getSize()}px`;
		}
		return vars;
	}, [
		// eslint-disable-next-line react-hooks/exhaustive-deps
		table.getState().columnSizingInfo,
		// eslint-disable-next-line react-hooks/exhaustive-deps
		table.getState().columnSizing,
	]);

	return (
		<div
			ref={scrollRef}
			className="max-h-[calc(100vh-6rem)] overflow-auto"
			style={columnSizeVars as React.CSSProperties}>
			<Table
				style={{ minWidth: `${table.getTotalSize()}px` }}
				className="border-b">
				<TableHeader className="bg-card sticky top-0 z-10">
					{table.getHeaderGroups().map(headerGroup => (
						<TableRow key={headerGroup.id}>
							{headerGroup.headers.map(header => {
								const pinStyles = getCommonPinningStyles(
									header.column,
								);
								const isPinned = header.column.getIsPinned();
								return (
									<TableHead
										key={header.id}
										colSpan={header.colSpan}
										className={cn(
											"group/header relative select-none",
											isPinned && "bg-card",
										)}
										style={{
											width: `var(--header-${header.id}-size)`,
											minWidth: `var(--header-${header.id}-size)`,
											maxWidth: `var(--header-${header.id}-size)`,
											...pinStyles,
										}}>
										<span className="flex items-center gap-1 [&:has(>[role='checkbox'])]:justify-center">
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
													<ArrowUp className="size-3.5 shrink-0" />
												:	<ArrowDown className="size-3.5 shrink-0" />

											:	null}
											{header.id !== "select" && (
												<ColumnHeaderMenu
													column={header.column}
												/>
											)}
										</span>
										{header.column.getCanResize() && (
											<div
												onDoubleClick={() =>
													header.column.resetSize()
												}
												onMouseDown={header.getResizeHandler()}
												onTouchStart={header.getResizeHandler()}
												className={cn(
													"absolute right-0 top-0 h-full w-1 cursor-col-resize touch-none select-none",
													(
														header.column.getIsResizing()
													) ?
														"bg-primary"
													:	"hover:bg-border",
												)}
											/>
										)}
									</TableHead>
								);
							})}
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
										width: `${table.getTotalSize()}px`,
										minWidth: "100%",
										height: `${virtualRow.size}px`,
										transform: `translateY(${virtualRow.start}px)`,
									}}
									className="flex">
									{row.getVisibleCells().map(cell => {
										const pinStyles =
											getCommonPinningStyles(cell.column);
										const isPinned =
											cell.column.getIsPinned();

										const cellContent =
											cell.getIsGrouped() ?
												<button
													onClick={row.getToggleExpandedHandler()}
													className="flex h-full w-full items-center gap-1 px-2">
													{row.getIsExpanded() ?
														<ChevronDown className="size-4 shrink-0" />
													:	<ChevronRight className="size-4 shrink-0" />
													}
													{flexRender(
														cell.column.columnDef
															.cell,
														cell.getContext(),
													)}
													<span className="text-muted-foreground ml-1 shrink-0 text-xs">
														({row.subRows.length})
													</span>
												</button>
											: cell.getIsAggregated() ?
												flexRender(
													cell.column.columnDef
														.aggregatedCell ??
														cell.column.columnDef
															.cell,
													cell.getContext(),
												)
											: cell.getIsPlaceholder() ? null
											: flexRender(
													cell.column.columnDef.cell,
													cell.getContext(),
												);

										if (cell.column.id === "select") {
											return (
												<TableCell
													key={cell.id}
													className={cn(
														"not-last:border-r flex items-center p-0 [&:has(>[role='checkbox'])]:justify-center",
														isPinned && "bg-card",
													)}
													style={{
														width: `var(--col-${cell.column.id}-size)`,
														minWidth: `var(--col-${cell.column.id}-size)`,
														maxWidth: `var(--col-${cell.column.id}-size)`,
														height: `${virtualRow.size}px`,
														...pinStyles,
													}}>
													{cellContent}
												</TableCell>
											);
										}

										return (
											<CellContextMenu
												key={cell.id}
												cell={cell}
												row={row}>
												<TableCell
													className={cn(
														"not-last:border-r flex items-center p-0",
														isPinned && "bg-card",
													)}
													style={{
														width: `var(--col-${cell.column.id}-size)`,
														minWidth: `var(--col-${cell.column.id}-size)`,
														maxWidth: `var(--col-${cell.column.id}-size)`,
														height: `${virtualRow.size}px`,
														...pinStyles,
													}}>
													{cellContent}
												</TableCell>
											</CellContextMenu>
										);
									})}
								</TableRow>
							);
						})
					:	<TableRow>
							<TableCell
								colSpan={columnSpan}
								className="h-[50vh] p-0 text-center">
								<Empty className="from-muted/50 to-background bg-linear-to-b h-full from-30%">
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
