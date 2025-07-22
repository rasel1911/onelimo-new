"use client";

import {
	ColumnDef,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { Eye, MoreVertical, Pencil } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { DeleteServiceProvider } from "@/app/(dashboard)/admin/components/delete-service-provider";
import { ServiceProviderSearch } from "@/app/(dashboard)/admin/components/service-provider-search";
import { ToggleServiceProviderStatus } from "@/app/(dashboard)/admin/components/toggle-service-provider-status";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

import { ServiceProviderStatusBadge } from "./service-provider-status-badge";

export type ServiceProvider = {
	id: string;
	name: string;
	email: string;
	phone: string;
	areaCovered?: string[] | null;
	serviceType?: string[] | null;
	status: string;
	role?: string;
	reputation?: number;
	responseTime?: number;
	createdAt: string;
	updatedAt: string;
};

interface ServiceProviderTableProps {
	data: ServiceProvider[];
	onServiceProviderDeleted?: () => void;
}

export const ServiceProviderTable = ({
	data,
	onServiceProviderDeleted,
}: ServiceProviderTableProps) => {
	const [globalFilter, setGlobalFilter] = useState("");

	const columns: ColumnDef<ServiceProvider>[] = [
		{
			accessorKey: "name",
			header: "Name",
			cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
		},
		{
			accessorKey: "email",
			header: "Email",
			cell: ({ row }) => <div className="text-muted-foreground">{row.getValue("email")}</div>,
		},
		{
			accessorKey: "phone",
			header: "Phone",
			cell: ({ row }) => <div className="text-muted-foreground">{row.getValue("phone")}</div>,
		},
		{
			accessorKey: "serviceType",
			header: "Service Type",
			cell: ({ row }) => {
				const serviceTypes = row.getValue("serviceType") as string[] | null;
				return (
					<div className="max-w-32 truncate">{serviceTypes?.join(", ") || "Not specified"}</div>
				);
			},
		},
		{
			accessorKey: "status",
			header: "Status",
			cell: ({ row }) => <ServiceProviderStatusBadge status={row.getValue("status")} />,
		},
		{
			accessorKey: "reputation",
			header: "Rating",
			cell: ({ row }) => {
				const reputation = row.getValue("reputation") as number | undefined;
				return <div className="text-center">{reputation ? `${reputation}/5` : "N/A"}</div>;
			},
		},
		{
			id: "actions",
			header: "Actions",
			cell: ({ row }) => (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" className="size-8 p-0">
							<span className="sr-only">Open menu</span>
							<MoreVertical className="size-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem asChild>
							<Link href={`/admin/service-providers/${row.original.id}`}>
								<Eye className="mr-2 size-4" />
								View Details
							</Link>
						</DropdownMenuItem>
						<DropdownMenuItem asChild>
							<Link href={`/admin/service-providers/${row.original.id}/edit`}>
								<Pencil className="mr-2 size-4" />
								Edit
							</Link>
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<ToggleServiceProviderStatus
							id={row.original.id}
							currentStatus={row.original.status}
							onStatusChanged={onServiceProviderDeleted}
						/>
						<DropdownMenuSeparator />
						<DeleteServiceProvider
							id={row.original.id}
							onServiceProviderDeleted={onServiceProviderDeleted}
						/>
					</DropdownMenuContent>
				</DropdownMenu>
			),
		},
	];

	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		globalFilterFn: "includesString",
		state: {
			globalFilter,
		},
		onGlobalFilterChange: setGlobalFilter,
	});

	return (
		<div className="space-y-4">
			<ServiceProviderSearch onSearchAction={setGlobalFilter} />
			<div className="rounded-md border">
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<TableHead key={header.id}>
										{header.isPlaceholder
											? null
											: flexRender(header.column.columnDef.header, header.getContext())}
									</TableHead>
								))}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows.length === 0 ? (
							<TableRow>
								<TableCell colSpan={columns.length} className="h-24 text-center">
									No service providers found.
								</TableCell>
							</TableRow>
						) : (
							table.getRowModel().rows.map((row) => (
								<TableRow key={row.id}>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id}>
											{flexRender(cell.column.columnDef.cell, cell.getContext())}
										</TableCell>
									))}
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</div>

			{/* Pagination */}
			<div className="flex items-center justify-between space-x-2 py-4">
				<div className="text-sm text-muted-foreground">
					Showing {table.getFilteredRowModel().rows.length} of {data.length} providers
				</div>
				<div className="flex items-center space-x-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() => table.previousPage()}
						disabled={!table.getCanPreviousPage()}
					>
						Previous
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={() => table.nextPage()}
						disabled={!table.getCanNextPage()}
					>
						Next
					</Button>
				</div>
			</div>
		</div>
	);
};
