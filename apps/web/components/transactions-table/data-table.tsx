"use client";

import { authClient } from "@budgetbee/core/auth-client";
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
import { useEditorStore } from "@/lib/store/editor-store";
import { cn } from "@budgetbee/ui/lib/utils";
import { getDb } from "@budgetbee/core/db";
import { useQueryClient } from "@tanstack/react-query";
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
import { FieldValues, FormProvider, useForm } from "react-hook-form";
import { columns } from "./columns";

export function TransactionsTable({
	ref,
}: {
	ref: React.RefObject<HTMLFormElement>;
}) {
	const queryClient = useQueryClient();
	const { data: authData } = authClient.useSession();
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

	const virtualizer = useVirtualizer({
		count: rows.length,
		estimateSize: () => 48, // 3 rem
		getScrollElement: () => ref.current,
		overscan: 20,
	});

	const isEditing = useEditorStore(s => s.is_editing);

	const formStates = useForm();

	const onSubmit = async (e: FieldValues) => {
		const db = await getDb();

		const diffs: Record<string, string>[] = [];
		const trUpdates: Record<string, Record<string, string>> = e.tr || {};
		Object.entries(trUpdates).forEach(([rowId, trUpdatedRow]) => {
			let diff: Record<string, any> = {};
			let diffCount = 0;

			let numRowId = Number(rowId);
			if (!Number.isSafeInteger(numRowId)) return;

			for (const trKey of Object.keys(trUpdatedRow)) {
				const row = rows[numRowId];
				const updatedRow = trUpdatedRow[trKey];

				if (trKey === "transaction_date") {
					const updatedTransactionDate = new Date(updatedRow)
						.toISOString()
						.slice(0, 10);
					const originalTransactionDate = (
						row.getValue(trKey) as string
					)?.slice(0, 10);

					if (updatedTransactionDate !== originalTransactionDate) {
						diff[trKey] = trUpdatedRow[trKey];
						diffCount++;
					}
				} else if (updatedRow !== row.getValue(trKey)) {
					diff[trKey] = trUpdatedRow[trKey];
					diffCount++;
				}
			}

			if (diffCount <= 0) return;

			const original = rows[numRowId].original;
			Object.keys(original).forEach(key => {
				if (diff[key] === undefined) diff[key] = original[key];
			});

			diff.user_id = authData?.user.id;
			diff.organization_id = authData?.session.activeOrganizationId;
			diffs.push(diff);
		});
		db.from("transactions")
			.upsert(diffs)
			.then(() => {
				window.alert("Transactions updated successfully.");
				queryClient.invalidateQueries({ queryKey: ["transactions"] });
				useEditorStore.setState({
					is_editing: false,
				});
			});
	};

	const columnSpan = table
		.getAllColumns()
		.filter(column => column.getIsVisible()).length;

	return (
		<FormProvider {...formStates}>
			<form
				ref={ref}
				onSubmit={formStates.handleSubmit(onSubmit)}
				className="border-input max-h-[calc(100vh-10rem)] overflow-auto rounded-md border">
				<Table containerClassName="h-full">
					<TableHeader className="bg-muted sticky top-0 z-10">
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
												minWidth: `${header.getSize()}px`,
												maxWidth: `${header.getSize()}px`,
												flexShrink: 0,
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
													:	<ArrowDown className="h-4 w-4" />

												:	null}
											</span>
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
						{isTransactionsLoading ?
							<TableRow>
								<TableCell
									colSpan={columnSpan}
									className="h-[50vh] p-0 text-center">
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
													minWidth: `${cell.column.getSize()}px`,
													maxWidth: `${cell.column.getSize()}px`,
													flexShrink: 0,
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
												No transcations found
											</EmptyTitle>
											<EmptyDescription>
												Click {`"New transaction"`} to
												add one.
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
