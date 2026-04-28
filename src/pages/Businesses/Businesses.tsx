import {useState} from "react";
import {ColumnDef} from "@tanstack/react-table";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import CommonTable from "../../components/tables/CommonTable/CommonTable.tsx";
import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import {Business} from "../../types/types.ts";
import {useGetBusinesses} from "../../api/business/useBusiness.ts";
import Button from "../../components/ui/button/Button.tsx";
import BusinessPaymentSettingsModal from "../../components/paymentSettings/BusinessPaymentSettingsModal.tsx";

function renderValue(value?: string) {
    if (!value || !value.trim()) return "—";
    return value;
}

export default function BusinessesPage() {
    const {data = [], isPending} = useGetBusinesses();
    const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);

    const columns: ColumnDef<Business>[] = [
        {accessorKey: "name", header: "Nomi"},
        {
            accessorKey: "phone",
            header: "Telefon",
            cell: ({row}) => renderValue(row.original.phone),
        },
        {
            accessorKey: "address",
            header: "Manzil",
            cell: ({row}) => (
                <div className="max-w-[260px] whitespace-normal break-words">
                    {renderValue(row.original.address)}
                </div>
            ),
        },
        {
            accessorKey: "description",
            header: "Tavsif",
            cell: ({row}) => (
                <div className="max-w-[320px] whitespace-normal break-words">
                    {renderValue(row.original.description)}
                </div>
            ),
        },
        {
            id: "actions",
            header: "",
            cell: ({row}) => (
                <Button size="sm" variant="outline" onClick={() => setSelectedBusiness(row.original)}>
                    Payment Settings
                </Button>
            ),
        },
    ];

    return (
        <>
            <PageMeta title="Businesses" description="Bizneslar ro'yxati"/>
            <PageBreadcrumb pageTitle="Bizneslar"/>
            <div className="space-y-6">
                <ComponentCard title="Bizneslar ro'yxati">
                    <CommonTable data={data} columns={columns} isPending={isPending}/>
                </ComponentCard>
            </div>
            <BusinessPaymentSettingsModal
                business={selectedBusiness}
                isOpen={Boolean(selectedBusiness)}
                onClose={() => setSelectedBusiness(null)}
            />
        </>
    );
}
