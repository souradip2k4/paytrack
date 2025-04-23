"use client";

import { type ApiKeysResoponse } from "@/lib/api";
import {
	ColumnDef,
	flexRender,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import React from "react";
import { Skeleton } from "../ui/skeleton";
import { columns } from "./columns";

export function TokensTable() {
	// @ts-ignore
	/*const [filters] = useQueryStates<FilterState>(
        {
            type: parseAsArrayOf(parseAsString).withDefault(["expired", "cancelled"]),
            status: parseAsArrayOf(parseAsString).withDefault([
                "approved",
                "rejected",
                "pending",
            ]),
        },
        { clearOnDefault: true },
    );*/

	const { user } = useUser();
	const { data, isLoading, isError, error } = useQuery<
		unknown,
		unknown,
		ApiKeysResoponse[]
	>({
		queryKey: ["api-keys", "GET", user?.id],
		queryFn: async () => {
			if (!user) {
				return [];
			}
			const res = await axios.get(`/api/users/${user?.id}/api-keys`);
			return res.data;
		},
		enabled: !!user && !!user.id,
	});

	const tableData = React.useMemo(() => {
		if (isLoading) return Array(8).fill({});
		if (!data) return [];
		return data;
	}, [isLoading, data]);

	const tableColumns = React.useMemo(
		() =>
			isLoading ?
				columns.map(c => ({
					...c,
					cell: () => <Skeleton className="h-4 w-full" />,
				}))
			:	columns,
		[isLoading, columns],
	);

	if (isError) return <div>{JSON.stringify(error)}</div>;
	return <DataTable data={tableData} columns={tableColumns} />;
}

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
}

function DataTable<TData, TValue>({
	columns,
	data,
}: DataTableProps<TData, TValue>) {
	console.log(data);

	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	if (!data) return <div></div>;

	return (
		<div className="rounded-md border">
			<Table>
				<TableHeader>
					{table.getHeaderGroups().map(headerGroup => (
						<TableRow key={headerGroup.id} className="bg-muted/50">
							{headerGroup.headers.map(header => {
								return (
									<TableHead key={header.id}>
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
					{table.getRowModel().rows?.length ?
						table.getRowModel().rows.map(row => (
							<TableRow
								key={row.id}
								data-state={row.getIsSelected() && "selected"}>
								{row.getVisibleCells().map(cell => (
									<TableCell key={cell.id}>
										{flexRender(
											cell.column.columnDef.cell,
											cell.getContext(),
										)}
									</TableCell>
								))}
							</TableRow>
						))
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
	);
}
