import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../../ui/table";
import {ColumnDef, flexRender, getCoreRowModel, getPaginationRowModel, useReactTable} from "@tanstack/react-table";
import {useState} from "react";
import Spinner from "../../common/Spinner.tsx";
import Pagination from "../Pagination/Pagination.tsx";


type TableProps<T> = {
    data: T[];
    columns: ColumnDef<T>[];
    isPending?: boolean;
};

export default function CommonTable<T>({data, columns, isPending}: TableProps<T>) {

    if (isPending) {
        return (
            <Spinner/>
        );
    }

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
    })


    const {getPageOptions, getState, setPageIndex, getCanPreviousPage, getCanNextPage, nextPage, previousPage} = table

    const currentPage = getState().pagination.pageIndex

    return (
        <div
            className="w-full min-w-0 overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
                <Table>
                    {/* Table Header */}
                    <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                        {table.getHeaderGroups().map((hg) => (
                            <TableRow key={hg.id}>
                                {hg.headers.map((header) => (
                                    <TableCell key={header.id} isHeader
                                               className="px-5 py-3 font-large text-md text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>

                    {/* Table Body */}
                    <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                        {table.getRowModel().rows.map((row) => (
                            <TableRow key={row.id}>
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id} className="px-5 py-4 sm:px-6 text-start">
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}                    </TableBody>
                </Table>
                <Pagination currentPage={currentPage} nextPage={nextPage} previousPage={previousPage}
                            getPageOptions={getPageOptions} getCanNextPage={getCanNextPage}
                            getCanPreviousPage={getCanPreviousPage}
                            onPageChange={setPageIndex}
                />
            </div>
        </div>
    );
}
