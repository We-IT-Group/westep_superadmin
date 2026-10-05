import {useMemo, useState} from "react";
import {ColumnDef} from "@tanstack/react-table";
import PageMeta from "../../components/common/PageMeta";
import CommonTable from "../../components/tables/CommonTable/CommonTable.tsx";
import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import Button from "../../components/ui/button/Button.tsx";
import {Modal} from "../../components/ui/modal";
import StatusToast from "../../components/paymentSettings/StatusToast.tsx";
import {StudentProfessionItem} from "../../api/studentProfessions/studentProfessionApi.ts";
import {
    useGetStudentProfessions,
    useReviewStudentProfession,
} from "../../api/studentProfessions/useStudentProfessions.ts";
import {GroupIcon} from "../../icons";

const STATUS_CONFIG: Record<string, { label: string; tone: string }> = {
    UNDER_REVIEW: {
        label: "Ko'rib chiqilmoqda",
        tone: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300 border-amber-200 dark:border-amber-500/20",
    },
    CONFIRMED: {
        label: "Tasdiqlangan",
        tone: "bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-300 border-success-200 dark:border-success-500/20",
    },
    RESELECTING: {
        label: "Qayta tanlashda",
        tone: "bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-300 border-purple-200 dark:border-purple-500/20",
    },
    COMPLETED: {
        label: "Yakunlangan",
        tone: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300 border-blue-200 dark:border-blue-500/20",
    },
    ABANDONED: {
        label: "Voz kechilgan",
        tone: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700",
    },
};

export default function StudentProfessionsReviewPage() {
    const [status, setStatus] = useState("UNDER_REVIEW");
    const [page] = useState(0);
    const [size] = useState(25);
    const [reselecting, setReselecting] = useState<StudentProfessionItem | null>(null);
    const [note, setNote] = useState("");
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

    const {data, isPending} = useGetStudentProfessions(status, page, size);
    const {mutateAsync: review, isPending: isReviewing} = useReviewStudentProfession();

    const items = useMemo(() => data?.content || [], [data?.content]);

    const handleApprove = async (id: string, title: string) => {
        if (!window.confirm(`"${title}" kasb tanlovini tasdiqlaysizmi?`)) return;
        try {
            await review({id, approve: true});
            setToast({message: "Kasb tanlovi tasdiqlandi", type: "success"});
        } catch (error) {
            setToast({message: error instanceof Error ? error.message : "Xatolik", type: "error"});
        }
    };

    const handleReselect = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reselecting) return;
        try {
            await review({id: reselecting.id, approve: false, note: note.trim() || undefined});
            setToast({message: "Bola qayta tanlashga yo'naltirildi", type: "success"});
            setReselecting(null);
            setNote("");
        } catch (error) {
            setToast({message: error instanceof Error ? error.message : "Xatolik", type: "error"});
        }
    };

    const columns: ColumnDef<StudentProfessionItem>[] = [
        {
            accessorKey: "title",
            header: "Kasb",
            cell: ({row}) => (
                <div className="flex items-center gap-2.5">
                    <span className="text-xl">{row.original.emoji || "🎯"}</span>
                    <div>
                        <span className="font-semibold text-gray-900 dark:text-white">
                            {row.original.title}
                        </span>
                        {row.original.source && (
                            <span className="block text-[11px] text-gray-400">
                                Manba: {row.original.source}
                            </span>
                        )}
                    </div>
                </div>
            ),
        },
        {
            accessorKey: "matchScore",
            header: "Moslik bali",
            cell: ({row}) => {
                const score = row.original.matchScore;
                if (score == null) return <span className="text-gray-400">—</span>;
                const isLow = score < 30;
                return (
                    <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            isLow
                                ? "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300 border border-amber-200"
                                : "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                        }`}
                    >
                        {score} ball {isLow && "⚠️"}
                    </span>
                );
            },
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
            accessorKey: "reviewNote",
            header: "Moderator izohi",
            cell: ({row}) => (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                    {row.original.reviewNote || "—"}
                </span>
            ),
        },
        {
            id: "actions",
            header: "Amallar",
            cell: ({row}) =>
                row.original.status === "UNDER_REVIEW" ? (
                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            onClick={() => handleApprove(row.original.id, row.original.title)}
                            isPending={isReviewing}
                        >
                            Tasdiqlash
                        </Button>
                        <Button
                            size="sm"
                            variant="danger"
                            onClick={() => {
                                setReselecting(row.original);
                                setNote("");
                            }}
                        >
                            Qayta tanlashga
                        </Button>
                    </div>
                ) : (
                    <span className="text-xs text-gray-400">—</span>
                ),
        },
    ];

    return (
        <>
            {toast && <StatusToast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            <PageMeta title="Kasb tanlovlari | Westep Admin" description="Bolalarning kasb tanlovlarini ko'rib chiqish" />
            <PageBreadcrumb pageTitle="Kasb tanlovlari" />

            <div className="space-y-6">
                {/* Header Strip */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
                    <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-300">
                                <GroupIcon className="h-4 w-4" />
                            </span>
                            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                                O'quvchilar kasb tanlovlari
                            </h2>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Bolaning kasb tanlovini tasdiqlang yoki yo'naltiruvchi izoh bilan qayta tanlashga yuboring. ⚠️ — tavsiya bali 30 dan past.
                        </p>
                    </div>

                    <div className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-300 self-start sm:self-auto">
                        Jami: {items.length} ta tanlov
                    </div>
                </div>

                {/* Pipeline Status Filter Tabs */}
                <div className="flex flex-wrap items-center gap-1.5 border-b border-gray-200 pb-3 dark:border-gray-800">
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
                <CommonTable data={items} columns={columns} isPending={isPending} />
            </div>

            {/* Accessible Reselect Modal */}
            <Modal
                isOpen={Boolean(reselecting)}
                onClose={() => setReselecting(null)}
                className="max-w-[500px] m-4 p-6 sm:p-7"
            >
                {reselecting && (
                    <form onSubmit={handleReselect} className="space-y-4">
                        <div className="flex items-center gap-2 border-b border-gray-100 pb-3 dark:border-gray-800">
                            <span className="text-2xl">🔄</span>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Qayta tanlashga yo'naltirish
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    "{reselecting.title}" kasbi uchun yo'naltiruvchi maslahat
                                </p>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="reselect-note" className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                                Bolaga maslahat yoki sabab izohi
                            </label>
                            <textarea
                                id="reselect-note"
                                rows={4}
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                className="mt-1.5 w-full rounded-lg border border-gray-300 bg-transparent px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                placeholder="Masalan: Test natijalaringizga ko'ra IT yoki Dasturlash yo'nalishi sizga ko'proq mos keladi..."
                            />
                        </div>

                        <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                            <Button type="button" variant="outline" onClick={() => setReselecting(null)}>
                                Bekor qilish
                            </Button>
                            <Button type="submit" variant="danger" isPending={isReviewing}>
                                Qayta tanlashga yuborish
                            </Button>
                        </div>
                    </form>
                )}
            </Modal>
        </>
    );
}
