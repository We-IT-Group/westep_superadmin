import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import CommonTable from "../../components/tables/CommonTable/CommonTable.tsx";
import {ColumnDef} from "@tanstack/react-table";
import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import {Link} from "react-router";
import {useState} from "react";
import {PencilIcon, TrashBinIcon} from "../../icons";
import DeleteModal from "../../components/common/DeleteModal.tsx";
import {BusinessDomain} from "../../types/types.ts";
import {useDeleteBusinessDomain, useGetBusinessDomains} from "../../api/businessDomains/useBusinessDomain.ts";

function formatDate(value?: string) {
    if (!value) return "—";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleString("uz-UZ", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function DomainActions({
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
                    to={`/business-domains/update/${id}`}
                    className="flex items-center text-green-600 hover:text-green-800"
                >
                    <PencilIcon className="text-2xl"/>
                </Link>
                <button
                    onClick={() => setOpen(true)}
                    className="text-red-600 hover:text-red-800 text-lg"
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

export default function BusinessDomainsPage() {
    const {data = [], isPending} = useGetBusinessDomains();
    const {mutateAsync, isPending: isDeletePending} = useDeleteBusinessDomain();

    const handleDelete = async (id: string) => {
        await mutateAsync(id);
    };

    const columns: ColumnDef<BusinessDomain>[] = [
        {accessorKey: "businessName", header: "Biznes"},
        {accessorKey: "landingHost", header: "Landing domain"},
        {accessorKey: "studentHost", header: "Student domain"},
        {
            accessorKey: "active",
            header: "Holat",
            cell: ({row}) => (
                <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                        row.original.active
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                    }`}
                >
                    {row.original.active ? "Faol" : "Nofaol"}
                </span>
            ),
        },
        {
            accessorKey: "updatedAt",
            header: "Yangilangan",
            cell: ({row}) => formatDate(row.original.updatedAt || row.original.createdAt),
        },
        {
            id: "actions",
            header: "",
            cell: ({row}) => (
                <DomainActions
                    id={row.original.id}
                    onDelete={handleDelete}
                    isPending={isDeletePending}
                />
            ),
        },
    ];

    return (
        <>
            <PageMeta title="Business Domains" description="Business va domain mappinglari"/>
            <PageBreadcrumb pageTitle="Business Domains" path="/business-domains/add"/>
            <div className="space-y-6">
                <ComponentCard title="Business Domains">
                    <CommonTable data={data} columns={columns} isPending={isPending}/>
                </ComponentCard>
            </div>
        </>
    );
}
