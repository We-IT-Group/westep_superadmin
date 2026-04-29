import {useState} from "react";
import {ColumnDef} from "@tanstack/react-table";
import {Link} from "react-router";
import {PencilIcon, TrashBinIcon} from "../../icons";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import CommonTable from "../../components/tables/CommonTable/CommonTable.tsx";
import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import DeleteModal from "../../components/common/DeleteModal.tsx";
import StatusToast from "../../components/paymentSettings/StatusToast.tsx";
import {CourseLanguage} from "../../types/types.ts";
import {useDeleteCourseLanguage, useGetCourseLanguages} from "../../api/courseLanguages/useCourseLanguage.ts";

function CourseLanguageActions({
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
                    to={`/course-languages/update/${id}`}
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

export default function CourseLanguagesPage() {
    const {data = [], isPending} = useGetCourseLanguages();
    const {mutateAsync: deleteCourseLanguage, isPending: isDeletePending} = useDeleteCourseLanguage();
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

    const handleDelete = async (id: string) => {
        try {
            await deleteCourseLanguage(id);
            setToast({message: "Kurs tili o'chirildi", type: "success"});
        } catch (error) {
            setToast({message: error instanceof Error ? error.message : "Kurs tili o'chmadi", type: "error"});
        }
    };

    const columns: ColumnDef<CourseLanguage>[] = [
        {accessorKey: "name", header: "Nomi"},
        {accessorKey: "code", header: "Kodi"},
        {
            accessorKey: "active",
            header: "Holat",
            cell: ({row}) => (
                <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                        row.original.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                    }`}
                >
                    {row.original.active ? "Faol" : "Nofaol"}
                </span>
            ),
        },
        {
            id: "actions",
            header: "",
            cell: ({row}) => (
                <CourseLanguageActions
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
            <PageMeta title="Kurs tillari" description="Kurs tillari ro'yxati"/>
            <PageBreadcrumb pageTitle="Kurs tillari" path="/course-languages/add"/>
            <div className="space-y-6">
                <ComponentCard title="Kurs tillari">
                    <CommonTable data={data} columns={columns} isPending={isPending}/>
                </ComponentCard>
            </div>
        </>
    );
}
