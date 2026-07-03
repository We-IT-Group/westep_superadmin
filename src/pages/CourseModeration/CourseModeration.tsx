import {useMemo, useState} from "react";
import {ColumnDef} from "@tanstack/react-table";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import CommonTable from "../../components/tables/CommonTable/CommonTable.tsx";
import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import Button from "../../components/ui/button/Button.tsx";
import {Modal} from "../../components/ui/modal";
import StatusToast from "../../components/paymentSettings/StatusToast.tsx";
import {CourseModerationCourse} from "../../types/types.ts";
import {
    useApproveCourseModeration,
    useGetCourseModerationList,
    useRejectCourseModeration
} from "../../api/courseModeration/useCourseModeration.ts";

function Badge({label, tone = "gray"}: { label: string; tone?: "green" | "orange" | "gray" | "blue" }) {
    const toneClass = {
        green: "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-300",
        orange: "bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-300",
        gray: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
        blue: "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300",
    }[tone];

    return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${toneClass}`}>{label}</span>;
}

export default function CourseModerationPage() {
    const [status, setStatus] = useState("");
    const [page] = useState(0);
    const [size] = useState(20);
    const [selectedCourse, setSelectedCourse] = useState<CourseModerationCourse | null>(null);
    const [rejectNote, setRejectNote] = useState("");
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

    const {data, isPending} = useGetCourseModerationList({status, page, size});
    const {mutateAsync: approveCourse, isPending: isApprovePending} = useApproveCourseModeration();
    const {mutateAsync: rejectCourse, isPending: isRejectPending} = useRejectCourseModeration();

    const courses = useMemo(() => data?.courses || [], [data?.courses]);

    const handleApprove = async (courseId: string) => {
        try {
            await approveCourse(courseId);
            setToast({message: "Kurs tasdiqlandi", type: "success"});
        } catch (error) {
            setToast({message: error instanceof Error ? error.message : "Tasdiqlashda xatolik", type: "error"});
        }
    };

    const handleReject = async () => {
        if (!selectedCourse) return;
        try {
            await rejectCourse({courseId: selectedCourse.id, note: rejectNote});
            setToast({message: "Kurs rad etildi", type: "success"});
            setSelectedCourse(null);
            setRejectNote("");
        } catch (error) {
            setToast({message: error instanceof Error ? error.message : "Rad etishda xatolik", type: "error"});
        }
    };

    const columns: ColumnDef<CourseModerationCourse>[] = [
        {accessorKey: "name", header: "Kurs"},
        {accessorKey: "status", header: "Holat", cell: ({row}) => <Badge label={row.original.status} tone="blue"/>},
        {accessorKey: "studentsCount", header: "Talabalar"},
        {accessorKey: "lessonsCount", header: "Darslar"},
        {
            accessorKey: "price",
            header: "Narx",
            cell: ({row}) => row.original.price ? `${row.original.price.toLocaleString("uz-UZ")} so'm` : "Bepul",
        },
        {
            id: "actions",
            header: "",
            cell: ({row}) => (
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        onClick={() => handleApprove(row.original.id)}
                        isPending={isApprovePending}
                    >
                        Tasdiqlash
                    </Button>
                    <Button
                        size="sm"
                        variant="danger"
                        onClick={() => setSelectedCourse(row.original)}
                    >
                        Rad etish
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <>
            {toast && <StatusToast message={toast.message} type={toast.type} onClose={() => setToast(null)}/>}
            <PageMeta title="Kurs moderatsiyasi" description="Kurslarni moderatsiya qilish"/>
            <PageBreadcrumb pageTitle="Kurs moderatsiyasi"/>
            <div className="space-y-6">
                <ComponentCard title="Moderatsiya navbati" desc="Ko'rib chiqilayotgan kurslarni tasdiqlang yoki rad eting">
                    <div className="flex flex-wrap items-center gap-3">
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="h-11 rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                        >
                            <option value="">Barcha statuslar</option>
                            <option value="REVIEW">REVIEW</option>
                            <option value="DRAFT">DRAFT</option>
                            <option value="REJECTED">REJECTED</option>
                            <option value="PUBLISHED">PUBLISHED</option>
                        </select>
                        <Badge label={`Jami: ${data?.totalItems || 0}`} tone="gray"/>
                    </div>
                    <CommonTable data={courses} columns={columns} isPending={isPending}/>
                </ComponentCard>
            </div>

            <Modal
                isOpen={Boolean(selectedCourse)}
                onClose={() => {
                    setSelectedCourse(null);
                    setRejectNote("");
                }}
                className="max-w-[640px] m-4 p-6 sm:p-8"
            >
                <div className="space-y-5">
                    <div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Kursni rad etish</h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Rad etish uchun izoh kiriting.
                        </p>
                    </div>
                    <textarea
                        value={rejectNote}
                        onChange={(e) => setRejectNote(e.target.value)}
                        rows={5}
                        className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                        placeholder="Reject sababi"
                    />
                    <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setSelectedCourse(null)}>
                            Bekor qilish
                        </Button>
                        <Button variant="danger" onClick={handleReject} isPending={isRejectPending}>
                            Rad etish
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    );
}
