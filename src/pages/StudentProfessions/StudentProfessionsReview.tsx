import {useMemo, useState} from "react";
import {ColumnDef} from "@tanstack/react-table";
import ComponentCard from "../../components/common/ComponentCard";
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

const STATUS_LABELS: Record<string, string> = {
    UNDER_REVIEW: "Ko'rib chiqilmoqda",
    CONFIRMED: "Tasdiqlangan",
    RESELECTING: "Qayta tanlashda",
    COMPLETED: "Yakunlangan",
    ABANDONED: "Voz kechilgan",
};

function StatusBadge({status}: { status: string }) {
    const tone = status === "CONFIRMED"
        ? "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-300"
        : status === "UNDER_REVIEW"
            ? "bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-300"
            : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
    return (
        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${tone}`}>
            {STATUS_LABELS[status] || status}
        </span>
    );
}

export default function StudentProfessionsReviewPage() {
    const [status, setStatus] = useState("UNDER_REVIEW");
    const [page] = useState(0);
    const [size] = useState(20);
    const [reselecting, setReselecting] = useState<StudentProfessionItem | null>(null);
    const [note, setNote] = useState("");
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

    const {data, isPending} = useGetStudentProfessions(status, page, size);
    const {mutateAsync: review, isPending: isReviewing} = useReviewStudentProfession();

    const items = useMemo(() => data?.content || [], [data?.content]);

    const handleApprove = async (id: string) => {
        try {
            await review({id, approve: true});
            setToast({message: "Tanlov tasdiqlandi", type: "success"});
        } catch (error) {
            setToast({message: error instanceof Error ? error.message : "Xatolik", type: "error"});
        }
    };

    const handleReselect = async () => {
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
            cell: ({row}) => `${row.original.emoji || ""} ${row.original.title}`.trim(),
        },
        {
            accessorKey: "matchScore",
            header: "Tavsiya bali",
            cell: ({row}) => {
                const score = row.original.matchScore;
                if (score == null) return "—";
                const low = score < 30;
                return (
                    <span className={low ? "font-semibold text-orange-600 dark:text-orange-400" : ""}>
                        {score}{low ? " ⚠️" : ""}
                    </span>
                );
            },
        },
        {accessorKey: "source", header: "Manba"},
        {
            accessorKey: "status",
            header: "Holat",
            cell: ({row}) => <StatusBadge status={row.original.status}/>,
        },
        {
            accessorKey: "reviewNote",
            header: "Izoh",
            cell: ({row}) => row.original.reviewNote || "—",
        },
        {
            id: "actions",
            header: "",
            cell: ({row}) => row.original.status === "UNDER_REVIEW" ? (
                <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleApprove(row.original.id)} isPending={isReviewing}>
                        Tasdiqlash
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => setReselecting(row.original)}>
                        Qayta tanlashga
                    </Button>
                </div>
            ) : null,
        },
    ];

    return (
        <>
            {toast && <StatusToast message={toast.message} type={toast.type} onClose={() => setToast(null)}/>}
            <PageMeta title="Kasb tanlovlari" description="Bolalar kasb tanlovlarini ko'rib chiqish"/>
            <PageBreadcrumb pageTitle="Kasb tanlovlari"/>
            <div className="space-y-6">
                <ComponentCard
                    title="Tanlovlar navbati"
                    desc="Bolaning kasb tanlovini tasdiqlang yoki qayta tanlashga yo'naltiring. ⚠️ — tavsiya bali past (30 dan kam)"
                >
                    <div className="flex flex-wrap items-center gap-3">
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="h-11 rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                        >
                            {Object.entries(STATUS_LABELS).map(([value, label]) => (
                                <option key={value} value={value}>{label}</option>
                            ))}
                        </select>
                    </div>
                    <CommonTable data={items} columns={columns} isPending={isPending}/>
                </ComponentCard>
            </div>

            <Modal
                isOpen={Boolean(reselecting)}
                onClose={() => {
                    setReselecting(null);
                    setNote("");
                }}
                className="max-w-[640px] m-4 p-6 sm:p-8"
            >
                <div className="space-y-5">
                    <div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Qayta tanlashga yo'naltirish
                        </h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Bolaga push bildirishnoma boradi. Izoh (ixtiyoriy) keyingi ko'riklar uchun saqlanadi.
                        </p>
                    </div>
                    <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        rows={4}
                        className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                        placeholder="Masalan: test natijasi boshqa yo'nalishlarni ko'rsatmoqda"
                    />
                    <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setReselecting(null)}>Bekor qilish</Button>
                        <Button variant="danger" onClick={handleReselect} isPending={isReviewing}>
                            Yo'naltirish
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    );
}
