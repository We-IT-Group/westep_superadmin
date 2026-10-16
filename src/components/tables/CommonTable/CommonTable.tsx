import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../../ui/table";
import {ColumnDef, flexRender, getCoreRowModel, getPaginationRowModel, useReactTable} from "@tanstack/react-table";
import {useState} from "react";
import Pagination from "../Pagination/Pagination.tsx";


type TableProps<T> = {
    data: T[];
    columns: ColumnDef<T>[];
    isPending?: boolean;
};

export default function CommonTable<T>({data = [], columns, isPending}: TableProps<T>) {
    const [pagination, setPagination] = useState({
        pageIndex: 0, //initial page index
        pageSize: 10, //default page size
    });

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onPaginationChange: setPagination,
        state: {
            pagination
        }
    });

    const {getPageOptions, getState, setPageIndex, getCanPreviousPage, getCanNextPage, nextPage, previousPage} = table;
    const currentPage = getState().pagination.pageIndex;
    const headerGroups = table.getHeaderGroups();
    const rows = table.getRowModel().rows;
    const totalColumns = columns.length || 1;

    return (
        <div className="w-full min-w-0 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-white/[0.02]">
            <div className="max-w-full overflow-x-auto">
                <Table>
                    {/* Table Header */}
                    <TableHeader className="border-b border-gray-200/70 bg-gray-50/60 dark:border-gray-800 dark:bg-white/[0.02]">
                        {headerGroups.map((hg) => (
                            <TableRow key={hg.id}>
                                {hg.headers.map((header) => (
                                    <TableCell
                                        key={header.id}
                                        isHeader
                                        className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-500 text-start dark:text-gray-400"
                                    >
                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>

                    {/* Table Body */}
                    <TableBody className="divide-y divide-gray-100 dark:divide-gray-800/60">
                        {isPending ? (
                            Array.from({length: 5}).map((_, rowIndex) => (
                                <TableRow key={`skeleton-${rowIndex}`} className="animate-pulse">
                                    {Array.from({length: totalColumns}).map((__, colIndex) => (
                                        <TableCell key={`skeleton-cell-${colIndex}`} className="px-5 py-4">
                                            <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-800" />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : rows.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={totalColumns}
                                    className="px-5 py-12 text-center"
                                >
                                    <div className="mx-auto flex max-w-sm flex-col items-center justify-center">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                                            <svg className="h-6 w-6 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                            </svg>
                                        </div>
                                        <p className="mt-3 text-sm font-medium text-gray-900 dark:text-gray-200">
                                            Ma'lumot topilmadi
                                        </p>
                                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                            Hozircha hech qanday ma'lumot mavjud emas.
                                        </p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    className="transition-colors hover:bg-gray-50/80 dark:hover:bg-white/[0.02]"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="px-5 py-4 text-start text-sm text-gray-700 dark:text-gray-300">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
                {!isPending && rows.length > 0 && (
                    <div className="border-t border-gray-100 py-2 dark:border-gray-800">
                        <Pagination
                            currentPage={currentPage}
                            nextPage={nextPage}
                            previousPage={previousPage}
                            getPageOptions={getPageOptions}
                            getCanNextPage={getCanNextPage}
                            getCanPreviousPage={getCanPreviousPage}
                            onPageChange={setPageIndex}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
