import {useState} from "react";
import {ColumnDef} from "@tanstack/react-table";
import {Link} from "react-router";
import {PencilIcon, TrashBinIcon} from "../../icons";
import {useDeleteSubscriptionPlan, useGetSubscriptionPlans} from "../../api/subscriptionPlans/useSubscriptionPlan.ts";
import ComponentCard from "../../components/common/ComponentCard";
import DeleteModal from "../../components/common/DeleteModal.tsx";
import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import PageMeta from "../../components/common/PageMeta";
import StatusToast from "../../components/paymentSettings/StatusToast.tsx";
import CommonTable from "../../components/tables/CommonTable/CommonTable.tsx";
import Alert from "../../components/ui/alert/Alert";
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
            <div className="flex items-center gap-3">
                <Link
                    to={`/subscription-plans/update/${id}`}
                    className="flex items-center text-green-600 hover:text-green-800"
                >
                    <PencilIcon className="text-2xl"/>
                </Link>
                <button
                    onClick={() => setOpen(true)}
                    className="text-red-600 hover:text-red-800 text-lg"
                    type="button"
                >
                    <TrashBinIcon className="text-2xl"/>
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
        {accessorKey: "name", header: "Nomi"},
        {accessorKey: "slug", header: "Slug"},
        {accessorKey: "tier", header: "Tier"},
        {
            accessorKey: "monthlyPrice",
            header: "Oylik narx",
            cell: ({row}) => `${row.original.monthlyPrice.toLocaleString("uz-UZ")} so'm`,
        },
        {
            accessorKey: "features",
            header: "Imkoniyatlar",
            cell: ({row}) => (
                <span className="text-sm text-gray-600">
                    {row.original.features.length} ta feature
                </span>
            ),
        },
        {
            accessorKey: "planActive",
            header: "Holat",
            cell: ({row}) => (
                <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                        row.original.planActive
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                    }`}
                >
                    {row.original.planActive ? "Faol" : "Nofaol"}
                </span>
            ),
        },
        {
            id: "actions",
            header: "",
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
            {toast && <StatusToast message={toast.message} type={toast.type} onClose={() => setToast(null)}/>}
            <PageMeta title="Obuna paketlari" description="Premium va obuna paketlari"/>
            <PageBreadcrumb pageTitle="Obuna paketlari" path="/subscription-plans/add"/>
            <div className="space-y-6">
                <Alert
                    variant="info"
                    title="Nazorat endpointlari hali yo'q"
                    message="Hozir bu bo'limda paket yaratish, tahrirlash va nofaol qilish ishlaydi. Student obunalari statistikasi va detail nazorati backenddagi admin subscription endpointlari chiqqach ulanadi."
                />
                <ComponentCard title="Subscription planlar">
                    <CommonTable data={data} columns={columns} isPending={isPending}/>
                </ComponentCard>
            </div>
        </>
    );
}
