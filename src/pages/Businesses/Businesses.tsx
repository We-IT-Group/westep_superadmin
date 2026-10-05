import {useMemo, useState} from "react";
import {ColumnDef} from "@tanstack/react-table";
import PageMeta from "../../components/common/PageMeta";
import CommonTable from "../../components/tables/CommonTable/CommonTable.tsx";
import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import {Business, BusinessDomain} from "../../types/types.ts";
import {useGetBusinesses} from "../../api/business/useBusiness.ts";
import Button from "../../components/ui/button/Button.tsx";
import BusinessPaymentSettingsModal from "../../components/paymentSettings/BusinessPaymentSettingsModal.tsx";
import {useGetBusinessDomains} from "../../api/businessDomains/useBusinessDomain.ts";
import BusinessDomainSettingsModal from "../../components/businessDomains/BusinessDomainSettingsModal.tsx";
import {BoxIcon, DollarLineIcon, PlugInIcon} from "../../icons";

function renderValue(value?: string | null) {
    if (!value || !value.trim()) return "—";
    return value;
}

export default function BusinessesPage() {
    const {data = [], isPending} = useGetBusinesses();
    const {data: businessDomains = []} = useGetBusinessDomains();
    const [search, setSearch] = useState("");
    const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
    const [selectedBusinessForDomain, setSelectedBusinessForDomain] = useState<Business | null>(null);

    const domainMap = useMemo(() => {
        return new Map((businessDomains as BusinessDomain[]).map((item) => [item.businessId, item]));
    }, [businessDomains]);

    const selectedDomain = selectedBusinessForDomain ? domainMap.get(selectedBusinessForDomain.id) || null : null;

    const stats = useMemo(() => {
        const total = data.length;
        let totalStudents = 0;
        let configuredDomains = 0;
        data.forEach((b) => {
            totalStudents += b.studentsCount || 0;
            if (domainMap.has(b.id)) configuredDomains++;
        });
        return {total, totalStudents, configuredDomains};
    }, [data, domainMap]);

    const filteredData = useMemo(() => {
        if (!search.trim()) return data;
        const q = search.toLowerCase();
        return data.filter(
            (b) =>
                b.name.toLowerCase().includes(q) ||
                (b.ownerFullName && b.ownerFullName.toLowerCase().includes(q)) ||
                (b.phone && b.phone.includes(q))
        );
    }, [data, search]);

    const columns: ColumnDef<Business>[] = [
        {
            accessorKey: "name",
            header: "Biznes / Markaz nomi",
            cell: ({row}) => (
                <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">
                        <BoxIcon className="h-4 w-4" />
                    </span>
                    <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                            {row.original.name}
                        </p>
                        {row.original.description && (
                            <p className="line-clamp-1 max-w-[240px] text-xs text-gray-500 dark:text-gray-400">
                                {row.original.description}
                            </p>
                        )}
                    </div>
                </div>
            ),
        },
        {
            accessorKey: "ownerFullName",
            header: "Mas'ul / Egasi",
            cell: ({row}) => (
                <span className="font-medium text-gray-700 dark:text-gray-300">
                    {renderValue(row.original.ownerFullName)}
                </span>
            ),
        },
        {
            accessorKey: "studentsCount",
            header: "Talabalar",
            cell: ({row}) => (
                <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
                    {row.original.studentsCount ?? 0} nafar
                </span>
            ),
        },
        {
            id: "membersCount",
            header: "Assistentlar / A'zolar",
            cell: ({row}) => {
                const assistantsCount = row.original.assistants ? Object.keys(row.original.assistants).length : 0;
                const membersCount = row.original.members?.length || 0;
                return (
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        {assistantsCount} ass. / {membersCount} a'zo
                    </span>
                );
            },
        },
        {
            accessorKey: "phone",
            header: "Telefon",
            cell: ({row}) => (
                <span className="text-xs text-gray-600 dark:text-gray-400">
                    {renderValue(row.original.phone)}
                </span>
            ),
        },
        {
            id: "landingHost",
            header: "Maxsus Domen",
            cell: ({row}) => {
                const d = domainMap.get(row.original.id);
                if (!d?.landingHost) {
                    return (
                        <span className="inline-flex items-center rounded bg-gray-100 px-2 py-0.5 text-[11px] text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                            Ulanmagan
                        </span>
                    );
                }
                return (
                    <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                        <PlugInIcon className="h-3 w-3" />
                        {d.landingHost}
                    </span>
                );
            },
        },
        {
            id: "actions",
            header: "Sozlamalar",
            cell: ({row}) => (
                <div className="flex items-center gap-2">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedBusinessForDomain(row.original)}
                        className="text-xs"
                    >
                        <PlugInIcon className="h-3.5 w-3.5 mr-1" />
                        Domen
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedBusiness(row.original)}
                        className="text-xs"
                    >
                        <DollarLineIcon className="h-3.5 w-3.5 mr-1" />
                        To'lov
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <>
            <PageMeta title="Bizneslar | Westep Admin" description="Hamkor o'quv markazlari va bizneslar boshqaruvi" />
            <PageBreadcrumb pageTitle="Bizneslar" />

            <div className="space-y-6">
                {/* Stats Overview */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="rounded-xl border border-gray-200/80 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
                        <span className="text-xs text-gray-500 dark:text-gray-400">Hamkor bizneslar soni</span>
                        <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                    </div>
                    <div className="rounded-xl border border-gray-200/80 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
                        <span className="text-xs text-gray-500 dark:text-gray-400">Jami qamrab olingan talabalar</span>
                        <p className="mt-1 text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.totalStudents.toLocaleString("uz-UZ")}</p>
                    </div>
                    <div className="rounded-xl border border-gray-200/80 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
                        <span className="text-xs text-gray-500 dark:text-gray-400">Uланган shaxsiy domenlar</span>
                        <p className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.configuredDomains}</p>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
                    <div className="relative w-full max-w-sm">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Biznes nomi, egasi yoki telefon..."
                            className="h-10 w-full rounded-lg border border-gray-300 bg-transparent px-3.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                        />
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                        Topildi: {filteredData.length} ta biznes
                    </span>
                </div>

                {/* Main Table */}
                <CommonTable data={filteredData} columns={columns} isPending={isPending} />
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
