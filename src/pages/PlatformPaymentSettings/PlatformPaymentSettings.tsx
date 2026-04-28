import {useState} from "react";
import {ColumnDef} from "@tanstack/react-table";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import CommonTable from "../../components/tables/CommonTable/CommonTable.tsx";
import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import Button from "../../components/ui/button/Button.tsx";
import PaymentSettingsFormModal from "../../components/paymentSettings/PaymentSettingsFormModal.tsx";
import StatusToast from "../../components/paymentSettings/StatusToast.tsx";
import {PaymentSettings, PaymentSettingsFormValues} from "../../types/types.ts";
import {
    useCreatePlatformPaymentSetting,
    useGetPlatformPaymentSettings,
    useUpdatePlatformPaymentSetting
} from "../../api/paymentSettings/usePaymentSettings.ts";

function Badge({
                   label,
                   tone = "gray",
               }: {
    label: string;
    tone?: "green" | "orange" | "blue" | "gray";
}) {
    const toneClass = {
        green: "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-300",
        orange: "bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-300",
        blue: "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300",
        gray: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    }[tone];

    return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${toneClass}`}>{label}</span>;
}

export default function PlatformPaymentSettingsPage() {
    const {data = [], isPending} = useGetPlatformPaymentSettings();
    const {mutateAsync: createSetting, isPending: isCreatePending} = useCreatePlatformPaymentSetting();
    const {mutateAsync: updateSetting, isPending: isUpdatePending} = useUpdatePlatformPaymentSetting();
    const [editingSetting, setEditingSetting] = useState<PaymentSettings | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

    const handleCreate = () => {
        setEditingSetting(null);
        setIsModalOpen(true);
    };

    const handleEdit = (setting: PaymentSettings) => {
        setEditingSetting(setting);
        setIsModalOpen(true);
    };

    const handleSubmit = async (values: PaymentSettingsFormValues) => {
        try {
            if (editingSetting?.id) {
                await updateSetting({id: editingSetting.id, values});
                setToast({message: "Platform payment setting yangilandi", type: "success"});
            } else {
                await createSetting(values);
                setToast({message: "Platform payment setting yaratildi", type: "success"});
            }
        } catch (error) {
            setToast({
                message: error instanceof Error ? error.message : "Payment setting saqlanmadi",
                type: "error",
            });
            throw error;
        }
    };

    const columns: ColumnDef<PaymentSettings>[] = [
        {accessorKey: "provider", header: "Provider"},
        {
            accessorKey: "displayName",
            header: "Display Name",
            cell: ({row}) => row.original.displayName || "—",
        },
        {
            accessorKey: "merchantId",
            header: "Merchant ID",
            cell: ({row}) => row.original.merchantId || "—",
        },
        {
            accessorKey: "login",
            header: "Login",
            cell: ({row}) => row.original.login || "—",
        },
        {
            accessorKey: "mode",
            header: "Mode",
            cell: ({row}) => <Badge label={row.original.mode} tone={row.original.mode === "PROD" ? "green" : "orange"}/>,
        },
        {
            accessorKey: "active",
            header: "Active",
            cell: ({row}) => <Badge label={row.original.active ? "Active" : "Inactive"} tone={row.original.active ? "green" : "gray"}/>,
        },
        {
            accessorKey: "primaryConfig",
            header: "Primary",
            cell: ({row}) => <Badge label={row.original.primaryConfig ? "Primary" : "Secondary"} tone={row.original.primaryConfig ? "blue" : "gray"}/>,
        },
        {
            accessorKey: "secretConfigured",
            header: "Secret",
            cell: ({row}) => <Badge label={row.original.secretConfigured ? "Configured" : "Missing"} tone={row.original.secretConfigured ? "green" : "orange"}/>,
        },
        {
            id: "actions",
            header: "",
            cell: ({row}) => (
                <Button size="sm" variant="outline" onClick={() => handleEdit(row.original)}>
                    Edit
                </Button>
            ),
        },
    ];

    return (
        <>
            {toast && <StatusToast message={toast.message} type={toast.type} onClose={() => setToast(null)}/>}
            <PageMeta title="Platform Payment Settings" description="Platform default payment settings"/>
            <PageBreadcrumb pageTitle="Platform Payment Settings"/>
            <div className="space-y-6">
                <ComponentCard
                    title="Platform Payment Settings"
                    desc="Platform default provider konfiguratsiyalari. Business override bo'lmasa shu config ishlaydi."
                >
                    <div className="flex justify-end">
                        <Button size="sm" onClick={handleCreate}>
                            Create Setting
                        </Button>
                    </div>
                    <CommonTable data={data} columns={columns} isPending={isPending}/>
                </ComponentCard>
            </div>

            <PaymentSettingsFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                setting={editingSetting}
                onSubmit={handleSubmit}
                isPending={isCreatePending || isUpdatePending}
                title={editingSetting ? "Edit Platform Payment Setting" : "Create Platform Payment Setting"}
            />
        </>
    );
}
