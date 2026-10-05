import {Link} from "react-router";
import PageMeta from "../../components/common/PageMeta";
import CommonTable from "../../components/tables/CommonTable/CommonTable.tsx";
import {useDeleteRole, useGetRoles} from "../../api/roles/useRole.ts";
import {ColumnDef} from "@tanstack/react-table";
import {Role} from "../../types/types.ts";
import Actions from "../../components/tables/Actions/Actions.tsx";
import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import Button from "../../components/ui/button/Button.tsx";
import {UserCircleIcon} from "../../icons";

export default function RolesPage() {
    const {data = [], isPending} = useGetRoles();
    const {mutate, isPending: isDeletePending} = useDeleteRole();

    const handleDelete = async (id: string) => {
        if (window.confirm("Ushbu lavozimni o'chirishni tasdiqlaysizmi?")) {
            await mutate(id);
        }
    };

    const columns: ColumnDef<Role>[] = [
        {
            accessorKey: "name",
            header: "Lavozim / Rol nomi",
            cell: ({row}) => (
                <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-300">
                        <UserCircleIcon className="h-4 w-4" />
                    </span>
                    <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                            {row.original.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {row.original.permissions?.length ? `${row.original.permissions.length} ta ruxsatnoma biriktirilgan` : "Ruxsatnomalar belgilanmagan"}
                        </p>
                    </div>
                </div>
            ),
        },
        {
            id: "actions",
            header: "Amallar",
            cell: ({row}) => (
                <Actions
                    isPending={isDeletePending}
                    deleteFunction={handleDelete}
                    id={row.original.id}
                />
            ),
        },
    ];

    return (
        <>
            <PageMeta
                title="Lavozimlar | Westep Admin"
                description="Foydalanuvchi rollari va ruxsatnomalar boshqaruvi"
            />
            <PageBreadcrumb pageTitle="Lavozimlar" />

            <div className="space-y-6">
                {/* Header Strip & Add Action */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
                    <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-300">
                                <UserCircleIcon className="h-4 w-4" />
                            </span>
                            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                                Tizim lavozimlari (Rollari)
                            </h2>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Xodimlar va moderatorlar uchun xavfsizlik ruxsatnomalari guruhlari
                        </p>
                    </div>

                    <Link to="/roles/add">
                        <Button size="sm">
                            <span className="mr-1.5">+</span> Yangi lavozim qo'shish
                        </Button>
                    </Link>
                </div>

                {/* Table */}
                <CommonTable data={data} columns={columns} isPending={isPending} />
            </div>
        </>
    );
}
