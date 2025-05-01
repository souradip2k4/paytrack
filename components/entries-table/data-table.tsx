"use client";

import { Entry, GetEntriesResponse } from "@/app/api/[[...route]]/server";
import { CreateEntriesButton } from "@/components/entries-editor";
import { Button } from "@/components/ui/button";
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { useStore } from "@/lib/store";
import { useUser } from "@clerk/nextjs";
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
import { EyeOff, Trash2 } from "lucide-react";
import { parseAsInteger, useQueryStates } from "nuqs";
import React from "react";
import { columns } from "./columns";
import { DeleteButton } from "./delete-button";
import { FilterEntriesButton } from "./filter-entries-button";

type FilterState = {
	page: number;
	page_size: number;
};

export function EntriesTable() {
	// @ts-ignore
	const [pagination, setPaginantion] = useQueryStates<FilterState>(
		{
			page: parseAsInteger.withDefault(1),
			page_size: parseAsInteger.withDefault(10),
		},
		{ clearOnDefault: true },
	);

	const filters = useStore(s => s.filters);

	const { user } = useUser();
	const { data, isLoading, isError, error } = useQuery<GetEntriesResponse>({
		queryKey: ["entries", "GET", user?.id, pagination, filters],
		queryFn: async () => {
			if (!user) {
				let res: GetEntriesResponse = {
					data: [],
					page: 1,
					page_size: 10,
					total: 0,
					has_prev: false,
					has_next: false,
				};
				return res;
			}
			const pg = new URLSearchParams(pagination).toString();
			const fl = new URLSearchParams(filters as any).toString();
			const res = await axios.get(
				`/api/users/${user?.id}/entries?${pg}&${fl}`,
			);
			return res.data;
		},
		enabled: !!user && !!user.id,
	});

	const tableData = React.useMemo(() => {
		if (isLoading) return Array(pagination.page_size || 10).fill({});
		if (!data || !data?.data) return [];
		return data.data;
	}, [isLoading, data]);

	const tableColumns = React.useMemo(
		() =>
			isLoading ?
				columns.map(c => ({
					...c,
					cell: () => <Skeleton className="my-2 h-4 w-full" />,
				}))
			:	columns,
		[isLoading, columns],
	);

	if (isError) return <div>{JSON.stringify(error)}</div>;

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
			<div className="flex items-center justify-end space-x-2 py-4">
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
			</div>
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
		{ ids: string[] }
	>({
		mutationFn: async data => {
			const res = await axios.delete("/api/entries", { data });
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
	});

	const deleteColumns = () => {
		const filtered_data = data
			.filter((_value, index) => rowSelection[index] === true)
			.map((x: any) => x.id);
		deleteEntriesMutation.mutate({ ids: filtered_data });
		setRowSelection({}); // reset selection
	};

	return (
		<div>
			<div className="flex items-center gap-2 pb-4 max-sm:flex-wrap">
				{/*(
                    <Input
                        placeholder="Filter messages..."
                        value={
                            (table
                                .getColumn("message")
                                ?.getFilterValue() as string) ?? ""
                        }
                        onChange={event =>
                            table
                                .getColumn("message")
                                ?.setFilterValue(event.target.value)
                        }
                        className="max-w-sm"
                    />
                )*/}
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
				{(table.getIsAllPageRowsSelected() ||
					table.getIsSomePageRowsSelected()) && (
					<Button
						size="icon"
						variant="outline"
						onClick={() => deleteColumns()}>
						<Trash2 className="size-4" />
					</Button>
				)}
				<FilterEntriesButton />
				<CreateEntriesButton />
			</div>
			<div className="border-input rounded-md border">
				<Table>
					<TableHeader className="bg-muted">
						{table.getHeaderGroups().map(headerGroup => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map(header => {
									return (
										<TableHead key={header.id}>
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
					<TableBody className="bg-muted/40">
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
						:	<TableRow>
								<TableCell
									colSpan={columns.length}
									className="h-24 text-center">
									No results.
								</TableCell>
							</TableRow>
						}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
