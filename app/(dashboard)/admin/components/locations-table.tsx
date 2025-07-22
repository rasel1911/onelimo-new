"use client";

import {
	ColumnDef,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { motion } from "framer-motion";
import { Loader2, MapPin, MoreVertical } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { DeleteLocation } from "@/app/(dashboard)/admin/components/delete-location";
import LocationSearch from "@/app/(dashboard)/admin/components/location-search";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
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

import { type Location } from "../locations/page";

interface LocationsTableProps {
	data: Location[];
	isLoading: boolean;
	onLocationDeleted?: () => void;
}

const LocationsTable = ({ data, isLoading, onLocationDeleted }: LocationsTableProps) => {
	const [globalFilter, setGlobalFilter] = useState("");

	const columns: ColumnDef<Location>[] = [
		{
			accessorKey: "city",
			header: "City",
			cell: ({ row }) => (
				<div className="flex items-center gap-2 font-medium">
					<MapPin className="size-4 text-muted-foreground" />
					<span>{row.getValue("city")}</span>
				</div>
			),
		},
		{
			accessorKey: "zipcodes",
			header: "Postcodes",
			cell: ({ row }) => {
				const zipcodes = row.original.zipcodes || [];
				return (
					<div className="hidden max-w-md flex-wrap gap-1 md:flex">
						{zipcodes.length > 0 ? (
							zipcodes.slice(0, 4).map((zipcode, index) => (
								<span key={index} className="rounded-md bg-muted px-2 py-0.5 text-xs">
									{zipcode}
								</span>
							))
						) : (
							<span className="text-muted-foreground">N/A</span>
						)}
						{zipcodes.length > 4 && (
							<span className="px-2 py-0.5 text-xs text-muted-foreground">
								+{zipcodes.length - 4} more
							</span>
						)}
					</div>
				);
			},
		},
		{
			accessorKey: "count",
			header: "Total Postcodes",
			cell: ({ row }) => {
				const zipcodes = row.original.zipcodes || [];
				return (
					<div className="ml-5 w-fit rounded-md bg-teal-400/20 px-2 py-0.5 text-base text-teal-400">
						<span className="font-medium">{zipcodes.length}</span>
					</div>
				);
			},
		},
		{
			id: "actions",
			header: () => <div className="text-right">Actions</div>,
			cell: ({ row }) => {
				const location = row.original;
				return (
					<div className="flex justify-end">
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="ghost" size="icon" className="size-8">
									<span className="sr-only">Open menu</span>
									<MoreVertical className="size-4" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<Link href={`/admin/locations/${location.id}`} passHref>
									<DropdownMenuItem>View</DropdownMenuItem>
								</Link>
								<Link href={`/admin/locations/${location.id}/edit`} passHref>
									<DropdownMenuItem>Edit</DropdownMenuItem>
								</Link>
								<DeleteLocation
									id={location.id}
									cityName={location.city}
									onLocationDeleted={onLocationDeleted}
								/>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				);
			},
		},
	];

	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		globalFilterFn: "includesString",
		state: {
			globalFilter,
		},
		onGlobalFilterChange: setGlobalFilter,
		initialState: {
			pagination: {
				pageSize: 10,
			},
		},
	});

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.4 }}
			className="space-y-4"
		>
			<motion.div
				initial={{ opacity: 0, y: -10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3, delay: 0.1 }}
				className="flex items-center gap-2"
			>
				<LocationSearch onSearchChange={setGlobalFilter} />
			</motion.div>

			{/* Table */}
			<motion.div
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.4, delay: 0.2 }}
				className="rounded-md border"
			>
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<TableHead
										key={header.id}
										className={header.id === "actions" ? "text-right" : ""}
									>
										{header.isPlaceholder
											? null
											: flexRender(header.column.columnDef.header, header.getContext())}
									</TableHead>
								))}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{isLoading ? (
							<motion.tr
								initial={{ opacity: 0, x: -10 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ duration: 0.15 }}
								className="flex items-center justify-center transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
							>
								<TableCell colSpan={columns.length} className="h-24">
									<Loader2 className="size-4 animate-spin" />
								</TableCell>
							</motion.tr>
						) : (
							<>
								{table.getRowModel().rows.length === 0 ? (
									<motion.tr>
										<TableCell colSpan={columns.length} className="h-24 text-center">
											No locations found.
										</TableCell>
									</motion.tr>
								) : (
									table.getRowModel().rows.map((row, index) => (
										<motion.tr
											key={row.id}
											initial={{ opacity: 0, x: -10 }}
											animate={{ opacity: 1, x: 0 }}
											transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
											className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
										>
											{row.getVisibleCells().map((cell) => (
												<TableCell key={cell.id}>
													{flexRender(cell.column.columnDef.cell, cell.getContext())}
												</TableCell>
											))}
										</motion.tr>
									))
								)}
							</>
						)}
					</TableBody>
				</Table>
			</motion.div>

			{/* Pagination */}
			<motion.div
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3, delay: 0.5 }}
				className="flex items-center justify-between space-x-2 py-4"
			>
				<div className="text-sm text-muted-foreground">
					Showing {table.getFilteredRowModel().rows.length} of {data.length} locations
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
			</motion.div>
		</motion.div>
	);
};

export default LocationsTable;
