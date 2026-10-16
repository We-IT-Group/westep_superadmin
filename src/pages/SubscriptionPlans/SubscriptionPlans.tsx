import {useState} from "react";
import {ColumnDef} from "@tanstack/react-table";
import {Link} from "react-router";
import {CheckCircleIcon, PencilIcon, TrashBinIcon} from "../../icons";
import {useDeleteSubscriptionPlan, useGetSubscriptionPlans} from "../../api/subscriptionPlans/useSubscriptionPlan.ts";
import DeleteModal from "../../components/common/DeleteModal.tsx";
import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import PageMeta from "../../components/common/PageMeta";
import StatusToast from "../../components/paymentSettings/StatusToast.tsx";
import CommonTable from "../../components/tables/CommonTable/CommonTable.tsx";
import Button from "../../components/ui/button/Button.tsx";
import {SubscriptionPlan} from "../../types/types.ts";

function SubscriptionPlanActions({
    id,
    onDelete,
    isPending,
}: {
    id: string;
    onDelete: (id: string) => Promise<void>;
    isPending: boolean;
}) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <div className="flex items-center gap-2">
                <Link
                    to={`/subscription-plans/update/${id}`}
                    className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-brand-600 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-brand-400 transition-colors"
                    title="Tahrirlash"
                >
                    <PencilIcon className="h-4 w-4" />
                </Link>
                <button
                    onClick={() => setOpen(true)}
                    className="rounded-lg p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-500/10 dark:hover:text-red-400 transition-colors"
                    type="button"
                    title="Nofaol qilish"
                >
                    <TrashBinIcon className="h-4 w-4" />
                </button>
            </div>
            <DeleteModal
                isPending={isPending}
                setOpen={setOpen}
                open={open}
                deleteFunction={() => onDelete(id)}
            />
        </>
    );
}

export default function SubscriptionPlansPage() {
    const {data = [], isPending} = useGetSubscriptionPlans();
    const {mutateAsync: deletePlan, isPending: isDeletePending} = useDeleteSubscriptionPlan();
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

    const handleDelete = async (id: string) => {
        try {
            await deletePlan(id);
            setToast({
                message: "Obuna paketi nofaol holatga o'tkazildi",
                type: "success",
            });
        } catch (error) {
            setToast({
                message: error instanceof Error ? error.message : "Obuna paketi o'chirilmadi",
                type: "error",
            });
        }
    };

    const columns: ColumnDef<SubscriptionPlan>[] = [
        {
            accessorKey: "name",
            header: "Tarif nomi",
            cell: ({row}) => (
                <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">
                        <CheckCircleIcon className="h-4 w-4" />
                    </span>
                    <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                            {row.original.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Slug: {row.original.slug}
                        </p>
                    </div>
                </div>
            ),
        },
        {
            accessorKey: "tier",
            header: "Darajasi (Tier)",
            cell: ({row}) => (
                <span className="inline-flex items-center rounded-md bg-purple-50 px-2 py-0.5 text-xs font-semibold text-purple-700 dark:bg-purple-500/10 dark:text-purple-300">
                    {row.original.tier}
                </span>
            ),
        },
        {
            accessorKey: "monthlyPrice",
            header: "Oylik narx",
            cell: ({row}) => (
                <span className="font-semibold text-gray-900 dark:text-white">
                    {row.original.monthlyPrice.toLocaleString("uz-UZ")} so'm
                </span>
            ),
        },
        {
            accessorKey: "features",
            header: "Imkoniyatlar",
            cell: ({row}) => (
                <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                    {row.original.features?.length ?? 0} ta imkoniyat
                </span>
            ),
        },
        {
            accessorKey: "planActive",
            header: "Holat",
            cell: ({row}) => {
                const isActive = row.original.planActive;
                return (
                    <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            isActive
                                ? "bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-300"
                                : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                        }`}
                    >
                        {isActive ? "Faol" : "Nofaol"}
                    </span>
                );
            },
        },
        {
            id: "actions",
            header: "Amallar",
            cell: ({row}) => (
                <SubscriptionPlanActions
                    id={row.original.id}
                    onDelete={handleDelete}
                    isPending={isDeletePending}
                />
            ),
        },
    ];

    return (
        <>
            {toast && <StatusToast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            <PageMeta title="Obuna paketlari | Westep Admin" description="Platforma tarif rejalari va paketlari" />
            <PageBreadcrumb pageTitle="Obuna paketlari" />

            <div className="space-y-6">
                {/* Header Strip & Add Action */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
                    <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">
                                <CheckCircleIcon className="h-4 w-4" />
                            </span>
                            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                                Obuna va Premium Paketlar
                            </h2>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Foydalanuvchilar va ota-onalar uchun oylik/yillik obuna tariflarini sozlash
                        </p>
                    </div>

                    <Link to="/subscription-plans/add">
                        <Button size="sm">
                            <span className="mr-1.5">+</span> Yangi paket qo'shish
                        </Button>
                    </Link>
                </div>

                {/* Main Table */}
                <CommonTable data={data} columns={columns} isPending={isPending} />
            </div>
        </>
    );
}
