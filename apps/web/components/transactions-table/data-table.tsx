"use client";

import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { authClient } from "@/lib/auth-client";
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

export function EntriesTable() {
	/** CLIENT STATES */
	const { data: authData } = authClient.useSession();
	const filterStack = useFilterStore(s => s.filter_stack);
	const pageSize = useFilterStore(s => s.display_page_size);
	const applyFilter = useFilterStore(s => s.apply_filter);

	const columnVisibility = useFilterStore(s => s.display_visibility_state);
	const rowSelection = useFilterStore(s => s.display_row_selection_state);
	const setColumnVisibility = useFilterStore(
		s => s.set_display_visibility_state,
	);
	const setRowSelection = useFilterStore(
		s => s.set_display_row_selection_state,
	);

	/** QUERY STATES */
	const { data, isPending } = useQuery<any>({
		queryKey: ["tr", "get", filterStack, pageSize],
		queryFn: async () => {
			if (!authData?.user) return [];

			const res = await applyFilter(
				db.from("transactions").select("*").order("transaction_date", {
					ascending: false,
				}),
			);

			if (res.error) {
				console.error(res.error);
				toast.error("Failed to fetch transactions");
				return [];
			}

			return res.data;
		},
		enabled: !!authData?.user,
	});

	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [columnFilters, setColumnFilters] =
		React.useState<ColumnFiltersState>([]);

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
		// rowCount: pagination.total,
		// pageCount: pagination.page,
	});

	React.useEffect(() => {
		console.log(rowSelection);
	}, [rowSelection]);

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

	/*const deleteColumns = () => {
        const filtered_data = data
            .filter((_, index) => rowSelection[index] === true)
            .map((x: any) => x.id);
        deleteEntriesMutation.mutate({
            ids: filtered_data,
        });
        setRowSelection({}); // reset selection
    };*/

	return (
		<div className="border-input rounded-md border">
			<Table>
				<TableHeader className="bg-muted">
					{data &&
						table.getHeaderGroups().map(headerGroup => (
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
					{data && table.getRowModel().rows?.length ?
						table.getRowModel().rows.map(row => {
							return (
								<TableRow
									key={row.id}
									data-state={
										row.getIsSelected() && "selected"
									}>
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
					:	<TableRow>
							<TableCell
								colSpan={columns.length}
								className="space-y-4 py-16 text-center">
								<h1 className="text-lg">No transactions</h1>
								<p className="text-muted-foreground mb-4 text-balance">
									Click {`\"New transaction\"`} to add one.
									<br />
									You can also import from a csv or excel file
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
	);
}

/*
{
    const authData = authClient.useSession();

    // @ts-ignore
    const [pagination, setPaginantion] = React.useState<FilterState>({
        page: 1,
        page_size: 10,
    });

    const { data, isLoading } = useQuery<any>({
        queryKey: ["tr", "get", filter_stack, pageSize],
        queryFn: async () => {
            if (!authData?.data?.user) return null;
            const res = await applyFilter(
                db.from("transactions").select("*").order("transaction_date", {
                    ascending: false,
                }),
            );

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
        </React.Fragment>
    );
}*/
