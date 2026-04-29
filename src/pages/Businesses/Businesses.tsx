import {useMemo, useState} from "react";
import {ColumnDef} from "@tanstack/react-table";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import CommonTable from "../../components/tables/CommonTable/CommonTable.tsx";
import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import {Business, BusinessDomain} from "../../types/types.ts";
import {useGetBusinesses} from "../../api/business/useBusiness.ts";
import Button from "../../components/ui/button/Button.tsx";
import BusinessPaymentSettingsModal from "../../components/paymentSettings/BusinessPaymentSettingsModal.tsx";
import {useGetBusinessDomains} from "../../api/businessDomains/useBusinessDomain.ts";
import BusinessDomainSettingsModal from "../../components/businessDomains/BusinessDomainSettingsModal.tsx";

function renderValue(value?: string) {
    if (!value || !value.trim()) return "—";
    return value;
}

export default function BusinessesPage() {
    const {data = [], isPending} = useGetBusinesses();
    const {data: businessDomains = []} = useGetBusinessDomains();
    const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
    const [selectedBusinessForDomain, setSelectedBusinessForDomain] = useState<Business | null>(null);

    const domainMap = useMemo(() => {
        return new Map((businessDomains as BusinessDomain[]).map((item) => [item.businessId, item]));
    }, [businessDomains]);

    const selectedDomain = selectedBusinessForDomain ? domainMap.get(selectedBusinessForDomain.id) || null : null;

    const columns: ColumnDef<Business>[] = [
        {accessorKey: "name", header: "Nomi"},
        {
            accessorKey: "ownerFullName",
            header: "Egasi",
            cell: ({row}) => renderValue(row.original.ownerFullName),
        },
        {
            accessorKey: "studentsCount",
            header: "Talabalar soni",
            cell: ({row}) => row.original.studentsCount ?? 0,
        },
        {
            id: "membersCount",
            header: "Assistentlar/A'zolar",
            cell: ({row}) => {
                const assistantsCount = row.original.assistants ? Object.keys(row.original.assistants).length : 0;
                const membersCount = row.original.members?.length || 0;
                return `${assistantsCount}/${membersCount}`;
            },
        },
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
            id: "landingHost",
            header: "Landing domeni",
            cell: ({row}) => renderValue(domainMap.get(row.original.id)?.landingHost),
        },
        {
            id: "studentHost",
            header: "Student domeni",
            cell: ({row}) => renderValue(domainMap.get(row.original.id)?.studentHost),
        },
        {
            id: "actions",
            header: "",
            cell: ({row}) => (
                <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" onClick={() => setSelectedBusinessForDomain(row.original)}>
                        Domain sozlash
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setSelectedBusiness(row.original)}>
                        Payment sozlash
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <>
            <PageMeta title="Bizneslar" description="Bizneslar ro'yxati"/>
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
            <BusinessDomainSettingsModal
                business={selectedBusinessForDomain}
                domain={selectedDomain}
                isOpen={Boolean(selectedBusinessForDomain)}
                onClose={() => setSelectedBusinessForDomain(null)}
            />
        </>
    );
}
