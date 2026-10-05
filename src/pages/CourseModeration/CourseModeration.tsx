import {useMemo, useState} from "react";
import {ColumnDef} from "@tanstack/react-table";
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
import {VideoIcon} from "../../icons";

const STATUS_CONFIG: Record<string, { label: string; tone: string }> = {
    REVIEW: {
        label: "Ko'rib chiqilmoqda",
        tone: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300 border-blue-200 dark:border-blue-500/20",
    },
    PUBLISHED: {
        label: "Nashr etilgan",
        tone: "bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-300 border-success-200 dark:border-success-500/20",
    },
    DRAFT: {
        label: "Qoralama",
        tone: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700",
    },
    REJECTED: {
        label: "Rad etilgan",
        tone: "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300 border-red-200 dark:border-red-500/20",
    },
};

const AGE_LABELS: Record<string, string> = {
    KIDS_5_8: "5–8 yosh",
    JUNIOR_9_12: "9–12 yosh",
    TEEN_13_17: "13–17 yosh",
};

export default function CourseModerationPage() {
    const [status, setStatus] = useState("");
    const [page] = useState(0);
    const [size] = useState(25);
    const [selectedCourse, setSelectedCourse] = useState<CourseModerationCourse | null>(null);
    const [rejectNote, setRejectNote] = useState("");
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

    const {data, isPending} = useGetCourseModerationList({status: status || undefined, page, size});
    const {mutateAsync: approveCourse, isPending: isApprovePending} = useApproveCourseModeration();
    const {mutateAsync: rejectCourse, isPending: isRejectPending} = useRejectCourseModeration();

    const courses = useMemo(() => data?.courses || [], [data?.courses]);

    const handleApprove = async (courseId: string, courseName: string) => {
        if (!window.confirm(`"${courseName}" kursini tasdiqlab, nashr etishga ruxsat berasizmi?`)) return;
        try {
            await approveCourse(courseId);
            setToast({message: "Kurs muvaffaqiyatli tasdiqlandi", type: "success"});
        } catch (error) {
            setToast({message: error instanceof Error ? error.message : "Tasdiqlashda xatolik", type: "error"});
        }
    };

    const handleReject = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCourse) return;
        if (!rejectNote.trim()) {
            setToast({message: "Rad etish sababini kiriting", type: "error"});
            return;
        }
        try {
            await rejectCourse({courseId: selectedCourse.id, note: rejectNote.trim()});
            setToast({message: "Kurs rad etildi va muallifga xabar yuborildi", type: "success"});
            setSelectedCourse(null);
            setRejectNote("");
        } catch (error) {
            setToast({message: error instanceof Error ? error.message : "Rad etishda xatolik", type: "error"});
        }
    };

    const columns: ColumnDef<CourseModerationCourse>[] = [
        {
            accessorKey: "name",
            header: "Kurs nomi",
            cell: ({row}) => (
                <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
                        <VideoIcon className="h-4 w-4" />
                    </span>
                    <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                            {row.original.name}
                        </p>
                        {row.original.description && (
                            <p className="line-clamp-1 max-w-[260px] text-xs text-gray-500 dark:text-gray-400">
                                {row.original.description}
                            </p>
                        )}
                    </div>
                </div>
            ),
        },
        {
            accessorKey: "status",
            header: "Holat",
            cell: ({row}) => {
                const s = row.original.status;
                const conf = STATUS_CONFIG[s] || {label: s, tone: "bg-gray-100 text-gray-700"};
                return (
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${conf.tone}`}>
                        {conf.label}
                    </span>
                );
            },
        },
        {
            accessorKey: "targetAgeGroups",
            header: "Yosh guruhi",
            cell: ({row}) => {
                const groups = row.original.targetAgeGroups || [];
                if (groups.length === 0) {
                    return (
                        <span className="inline-flex items-center rounded bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                            Belgilanmagan
                        </span>
                    );
                }
                return (
                    <div className="flex flex-wrap gap-1">
                        {groups.map((g) => (
                            <span key={g} className="inline-flex items-center rounded bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                                {AGE_LABELS[g] || g}
                            </span>
                        ))}
                    </div>
                );
            },
        },
        {
            accessorKey: "lessonsCount",
            header: "Darslar",
            cell: ({row}) => (
                <span className="font-medium text-gray-700 dark:text-gray-300">
                    {row.original.lessonsCount ?? 0} ta dars
                </span>
            ),
        },
        {
            accessorKey: "studentsCount",
            header: "O'quvchilar",
            cell: ({row}) => (
                <span className="font-medium text-gray-700 dark:text-gray-300">
                    {row.original.studentsCount ?? 0} ta
                </span>
            ),
        },
        {
            accessorKey: "price",
            header: "Narxi",
            cell: ({row}) => {
                const price = row.original.price;
                return (
                    <span className="font-semibold text-gray-900 dark:text-white">
                        {price ? `${price.toLocaleString("uz-UZ")} so'm` : "Bepul"}
                    </span>
                );
            },
        },
        {
            id: "actions",
            header: "Moderatsiya",
            cell: ({row}) => (
                <div className="flex items-center gap-2">
                    <Button
                        size="sm"
                        onClick={() => handleApprove(row.original.id, row.original.name)}
                        isPending={isApprovePending}
                    >
                        Tasdiqlash
                    </Button>
                    <Button
                        size="sm"
                        variant="danger"
                        onClick={() => {
                            setSelectedCourse(row.original);
                            setRejectNote("");
                        }}
                    >
                        Rad etish
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <>
            {toast && <StatusToast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            <PageMeta title="Kurs moderatsiyasi | Westep Admin" description="Kurslarni tekshirish va tasdiqlash" />
            <PageBreadcrumb pageTitle="Kurs moderatsiyasi" />

            <div className="space-y-6">
                {/* Header Information Strip */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
                    <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
                                <VideoIcon className="h-4 w-4" />
                            </span>
                            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                                Kurslar moderatsiyasi navbati
                            </h2>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Mualliflar tomonidan yuklangan video darslar, tavsiflar va narxlarni tasdiqlash yoki qayta ishlashga qaytarish.
                        </p>
                    </div>

                    <div className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-300 self-start sm:self-auto">
                        Jami: {data?.totalItems ?? courses.length} ta kurs
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex flex-wrap items-center gap-1.5 border-b border-gray-200 pb-3 dark:border-gray-800">
                    <button
                        type="button"
                        onClick={() => setStatus("")}
                        className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                            status === ""
                                ? "bg-brand-500 text-white shadow-sm"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                        }`}
                    >
                        Barchasi
                    </button>
                    {Object.entries(STATUS_CONFIG).map(([value, conf]) => {
                        const isCurrent = status === value;
                        return (
                            <button
                                key={value}
                                type="button"
                                onClick={() => setStatus(value)}
                                className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                                    isCurrent
                                        ? "bg-brand-500 text-white shadow-sm"
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                                }`}
                            >
                                {conf.label}
                            </button>
                        );
                    })}
                </div>

                {/* Main Table */}
                <CommonTable data={courses} columns={columns} isPending={isPending} />
            </div>

            {/* Rejection Modal with Label & Guidance */}
            <Modal
                isOpen={Boolean(selectedCourse)}
                onClose={() => {
                    setSelectedCourse(null);
                    setRejectNote("");
                }}
                className="max-w-[560px] m-4 p-6 sm:p-7"
            >
                {selectedCourse && (
                    <form onSubmit={handleReject} className="space-y-4">
                        <div className="flex items-center gap-2 border-b border-gray-100 pb-3 dark:border-gray-800">
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-300">
                                ✕
                            </span>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Kursni rad etish
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    "{selectedCourse.name}" kursi uchun tuzatish talablarini bildiring
                                </p>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="reject-note" className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                                Rad etish sababi / Tuzatish izohi <span className="text-error-500">*</span>
                            </label>
                            <textarea
                                id="reject-note"
                                rows={4}
                                required
                                value={rejectNote}
                                onChange={(e) => setRejectNote(e.target.value)}
                                className="mt-1.5 w-full rounded-lg border border-gray-300 bg-transparent px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                placeholder="Masalan: 3-darsdagi audio sifati past, iltimos qayta yozib yuklang."
                            />
                            <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
                                Ushbu izoh kurs muallifiga yuboriladi va u kursni qayta tahrirlab topshira oladi.
                            </p>
                        </div>

                        <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setSelectedCourse(null);
                                    setRejectNote("");
                                }}
                            >
                                Bekor qilish
                            </Button>
                            <Button type="submit" variant="danger" isPending={isRejectPending}>
                                Rad etish va xabar jo'natish
                            </Button>
                        </div>
                    </form>
                )}
            </Modal>
        </>
    );
}
