import React from "react";

type PaginationProps = {
    currentPage: number;
    onPageChange: (page: number) => void;
    getCanPreviousPage: () => boolean;
    getCanNextPage: () => boolean;
    previousPage: () => void;
    nextPage: () => void;
    getPageOptions: () => number[];
};

const Pagination: React.FC<PaginationProps> = ({
                                                   currentPage,
                                                   onPageChange,
                                                   getCanPreviousPage,
                                                   getCanNextPage,
                                                   previousPage,
                                                   nextPage,
                                                   getPageOptions,
                                               }) => {
    return (
        <div className="flex items-center justify-center gap-4 px-4 py-2">
            {/* Previous button */}
            <button
                onClick={() => getCanPreviousPage() && previousPage()}
                disabled={!getCanPreviousPage()}
                className={`flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 ${
                    !getCanPreviousPage() ? "opacity-50 cursor-not-allowed" : ""
                }`}
            >
                <svg
                    className="fill-current"
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                >
                    <path
                        d="M2.582 9.998c0 .228.1.43.258.568l4.957 4.997c.292.293.767.293 1.06 0s.293-.768 0-1.06L5.139 10.747H16.667c.414 0 .75-.336.75-.75s-.336-.75-.75-.75H5.145l3.715-3.717c.293-.292.293-.767 0-1.06s-.767-.293-1.06 0L2.84 9.43a.75.75 0 00-.258.568z"/>
                </svg>
                <span className="hidden sm:inline">Previous</span>
            </button>

            {/* Page numbers */}
            <ul className="hidden sm:flex items-center gap-1">
                {getPageOptions().map((page, idx) => (
                    <li key={idx}>
                        <button
                            onClick={() => {
                                onPageChange(page)
                            }}
                            className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium ${
                                currentPage == page
                                    ? "bg-brand-500 text-white"
                                    : "text-gray-700 hover:bg-brand-500 hover:text-white dark:text-gray-400 dark:hover:text-white"
                            }`}
                        >
                            {page + 1}
                        </button>
                    </li>
                ))}
            </ul>

            {/* Next button */}
            <button
                onClick={() => getCanNextPage() && nextPage()}
                disabled={!getCanNextPage()}
                className={`flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 ${
                    !getCanNextPage() ? "opacity-50 cursor-not-allowed" : ""
                }`}
            >
                <span className="hidden sm:inline">Next</span>
                <svg
                    className="fill-current"
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                >
                    <path
                        d="M17.417 9.998c0 .228-.1.43-.258.568l-4.957 4.997c-.293.293-.767.293-1.06 0s-.293-.768 0-1.06l3.72-3.717H3.332c-.414 0-.75-.336-.75-.75s.336-.75.75-.75h11.522l-3.72-3.717c-.293-.292-.293-.767 0-1.06s.767-.293 1.06 0l4.958 4.94c.157.137.258.34.258.568z"/>
                </svg>
            </button>
        </div>
    );
};

export default Pagination;