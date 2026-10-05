import {useMemo, useState} from "react";
import {ColumnDef} from "@tanstack/react-table";
import PageMeta from "../../components/common/PageMeta";
import CommonTable from "../../components/tables/CommonTable/CommonTable.tsx";
import Button from "../../components/ui/button/Button.tsx";
import Badge from "../../components/ui/badge/Badge";
import {Modal} from "../../components/ui/modal";
import StatusToast from "../../components/paymentSettings/StatusToast.tsx";
import {SchoolLeadDto, SchoolLeadStage} from "../../api/growth/growthApi.ts";
import {useDeleteSchoolLead, useSaveSchoolLead, useSchoolLeads} from "../../api/growth/useGrowth.ts";
import {formatSom, INPUT_CLASS, isoDate, STAGE_LABELS} from "./labels.ts";
import GrowthNav from "./components/GrowthNav.tsx";

interface LeadDraft {
    id: string | null;
    name: string;
    city: string;
    contactName: string;
    contactPhone: string;
    stage: SchoolLeadStage;
    studentCount: string;
    monthlyFee: string;
    nextActionDate: string;
    note: string;
}

const STAGES: SchoolLeadStage[] = ["NEW", "CONTACTED", "DEMO", "PILOT", "LICENSE", "LOST"];

const emptyDraft = (): LeadDraft => ({
    id: null,
    name: "",
    city: "Toshkent",
    contactName: "",
    contactPhone: "",
    stage: "NEW",
    studentCount: "",
    monthlyFee: "",
    nextActionDate: "",
    note: "",
});

const toDraft = (lead: SchoolLeadDto): LeadDraft => ({
    id: lead.id,
    name: lead.name,
    city: lead.city || "",
    contactName: lead.contactName || "",
    contactPhone: lead.contactPhone || "",
    stage: lead.stage,
    studentCount: lead.studentCount != null ? String(lead.studentCount) : "",
    monthlyFee: lead.monthlyFee != null ? String(lead.monthlyFee) : "",
    nextActionDate: lead.nextActionDate || "",
    note: lead.note || "",
});

const toNumber = (value: string) => (value.trim() === "" ? null : Number(value));

const STAGE_COLORS: Record<SchoolLeadStage, "primary" | "success" | "error" | "warning" | "info" | "light"> = {
    NEW: "light",
    CONTACTED: "info",
    DEMO: "primary",
    PILOT: "warning",
    LICENSE: "success",
    LOST: "error",
};

export default function SchoolsPage() {
    const todayStr = useMemo(() => isoDate(new Date()), []);
    const {data: leads = [], isPending} = useSchoolLeads();
    const saveLead = useSaveSchoolLead();
    const deleteLead = useDeleteSchoolLead();

    const [stage, setStage] = useState<SchoolLeadStage | "">("");
    const [draft, setDraft] = useState<LeadDraft | null>(null);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

    const visible = useMemo(() => leads.filter((l) => !stage || l.stage === stage), [leads, stage]);
    const countOf = (s: SchoolLeadStage) => leads.filter((l) => l.stage === s).length;

    const handleSave = async () => {
        if (!draft) return;
        if (!draft.name.trim()) {
            setToast({message: "Maktab nomi kiritilishi shart", type: "error"});
            return;
        }
        try {
            await saveLead.mutateAsync({
                id: draft.id,
                body: {
                    name: draft.name.trim(),
                    city: draft.city.trim() || null,
                    contactName: draft.contactName.trim() || null,
                    contactPhone: draft.contactPhone.trim() || null,
                    stage: draft.stage,
                    studentCount: toNumber(draft.studentCount),
                    monthlyFee: toNumber(draft.monthlyFee),
                    nextActionDate: draft.nextActionDate || null,
                    note: draft.note.trim() || null,
                },
            });
            setToast({
                message: draft.id ? "Maktab ma'lumotlari yangilandi" : "Yangi maktab ro'yxatga qo'shildi",
                type: "success",
            });
            setDraft(null);
        } catch (e) {
            setToast({message: (e as Error).message, type: "error"});
        }
    };

    const handleDelete = async (lead: SchoolLeadDto) => {
        if (!window.confirm(`"${lead.name}" maktabini o'chirishni tasdiqlaysizmi?`)) return;
        try {
            await deleteLead.mutateAsync(lead.id);
            setToast({message: "Maktab o'chirildi", type: "success"});
        } catch (e) {
            setToast({message: (e as Error).message, type: "error"});
        }
    };

    const columns: ColumnDef<SchoolLeadDto>[] = [
        {
            accessorKey: "name",
            header: "Maktab nomi",
            cell: ({row}) => (
                <div className="py-1">
                    <div className="font-semibold text-sm text-gray-900 dark:text-white">
                        {row.original.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                        {row.original.city || "Toshkent"}
                    </div>
                </div>
            ),
        },
        {
            accessorKey: "contactName",
            header: "Mas'ul shaxs va telefon",
            cell: ({row}) => (
                <div className="text-xs">
                    <div className="font-medium text-gray-900 dark:text-gray-200">
                        {row.original.contactName || "—"}
                    </div>
                    {row.original.contactPhone && (
                        <a
                            href={`tel:${row.original.contactPhone}`}
                            className="mt-0.5 inline-block font-mono text-brand-600 hover:underline dark:text-brand-400"
                        >
                            {row.original.contactPhone}
                        </a>
                    )}
                </div>
            ),
        },
        {
            accessorKey: "stage",
            header: "Bosqich",
            cell: ({row}) => (
                <Badge size="sm" color={STAGE_COLORS[row.original.stage]}>
                    {STAGE_LABELS[row.original.stage]}
                </Badge>
            ),
        },
        {
            accessorKey: "studentCount",
            header: "O'quvchilar soni",
            cell: ({row}) => (
                <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                    {row.original.studentCount != null ? `${row.original.studentCount.toLocaleString("ru-RU")} ta` : "—"}
                </span>
            ),
        },
        {
            accessorKey: "monthlyFee",
            header: "Kutilayotgan oylik to'lov",
            cell: ({row}) => (
                <span className="text-xs font-bold text-gray-900 dark:text-white">
                    {row.original.monthlyFee != null ? formatSom(row.original.monthlyFee) : "—"}
                </span>
            ),
        },
        {
            accessorKey: "nextActionDate",
            header: "Keyingi qadam sanasi",
            cell: ({row}) => {
                const date = row.original.nextActionDate;
                if (!date) return <span className="text-gray-400 text-xs">—</span>;
                const isOverdue = date < todayStr && row.original.stage !== "LICENSE" && row.original.stage !== "LOST";
                const isToday = date === todayStr;

                return (
                    <span
                        className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md ${
                            isOverdue
                                ? "bg-error-50 text-error-700 dark:bg-error-500/10 dark:text-error-300"
                                : isToday
                                ? "bg-warning-50 text-warning-700 dark:bg-warning-500/10 dark:text-warning-300"
                                : "text-gray-600 dark:text-gray-400"
                        }`}
                    >
                        {date} {isOverdue ? "(kechikdi!)" : isToday ? "(bugun)" : ""}
                    </span>
                );
            },
        },
        {
            id: "actions",
            header: "",
            cell: ({row}) => (
                <div className="flex items-center justify-end gap-1.5">
                    <button
                        type="button"
                        onClick={() => setDraft(toDraft(row.original))}
                        className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition"
                    >
                        Tahrirlash
                    </button>
                    <button
                        type="button"
                        onClick={() => handleDelete(row.original)}
                        className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-error-600 hover:bg-error-50 dark:hover:bg-error-500/10 transition"
                    >
                        O'chirish
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div className="mx-auto max-w-7xl">
            {toast && <StatusToast message={toast.message} type={toast.type} onClose={() => setToast(null)}/>}
            <PageMeta title="Maktablar — Xususiy maktablar pilot dasturi" description="Xususiy maktablar pilot dasturi"/>

            <GrowthNav
                title="Xususiy maktablar (B2B Pilot)"
                subtitle="Maqsad: 10 ta murojaat → 5 ta demo → 3 ta pilot → 1–2 ta doimiy litsenziya."
                action={
                    <Button size="sm" onClick={() => setDraft(emptyDraft())} className="min-h-[44px] shadow-sm active:scale-[0.98]">
                        + Yangi maktab qo'shish
                    </Button>
                }
            />

            <div className="space-y-6">
                {/* 1. Xususiy maktablar bosqichlar voronkasi (Visual Stage Funnel Pipeline) */}
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs dark:border-gray-800 dark:bg-white/[0.02]">
                    <div className="border-b border-gray-100 pb-3 dark:border-gray-800 flex items-center justify-between">
                        <div>
                            <h2 className="text-sm font-bold text-gray-900 dark:text-white">
                                Maktablar CRM bosqichlari
                            </h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Har bir bosqich kartasini bosib, faqat shu bosqichdagi maktablarni ko'rishingiz mumkin.
                            </p>
                        </div>
                        <span className="text-xs font-medium text-gray-400">
                            Jami: {leads.length} ta maktab
                        </span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-6">
                        {STAGES.map((s) => {
                            const isSelected = stage === s;
                            const count = countOf(s);
                            const isLost = s === "LOST";

                            return (
                                <button
                                    key={s}
                                    type="button"
                                    onClick={() => setStage(stage === s ? "" : s)}
                                    className={`group flex flex-col justify-between rounded-xl border p-3.5 text-left transition-all min-h-[76px] active:scale-[0.98] ${
                                        isSelected
                                            ? "border-brand-500 bg-brand-50/70 dark:bg-brand-500/10 ring-1 ring-brand-500 shadow-xs"
                                            : "border-gray-200 bg-white hover:border-gray-300 dark:border-gray-800 dark:bg-gray-900"
                                    }`}
                                >
                                    <div className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                                        {STAGE_LABELS[s]}
                                    </div>
                                    <div className="mt-1 flex items-baseline justify-between">
                                        <span
                                            className={`text-2xl font-black ${
                                                isLost
                                                    ? "text-gray-400 dark:text-gray-500"
                                                    : count > 0
                                                    ? "text-gray-900 dark:text-white"
                                                    : "text-gray-400"
                                            }`}
                                        >
                                            {count}
                                        </span>
                                        <span className="text-[10px] font-medium text-gray-400 group-hover:text-brand-600 transition">
                                            {isSelected ? "Yechish" : "Filtr"}
                                        </span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 2. Maktablar jadvali */}
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs dark:border-gray-800 dark:bg-white/[0.02]">
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 font-medium">Filtr:</span>
                            <button
                                type="button"
                                onClick={() => setStage("")}
                                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                                    stage === ""
                                        ? "bg-brand-500 text-white shadow-xs"
                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
                                }`}
                            >
                                Barchasi ({leads.length})
                            </button>
                            {stage !== "" && (
                                <span className="inline-flex items-center gap-1 rounded-lg bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
                                    Tanlandi: {STAGE_LABELS[stage]} ({visible.length})
                                </span>
                            )}
                        </div>

                        <span className="text-xs text-gray-400">
                            Muzokara holatini o'z vaqtida yangilab turing
                        </span>
                    </div>

                    <div className="mt-4">
                        <CommonTable data={visible} columns={columns} isPending={isPending}/>
                    </div>

                    {!isPending && visible.length === 0 && (
                        <div className="rounded-2xl border border-dashed border-gray-200 p-12 text-center dark:border-gray-800">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                {stage ? `"${STAGE_LABELS[stage]}" bosqichida maktablar topilmadi.` : "Hali maktablar ro'yxati kiritilmagan."}
                            </p>
                            <p className="mt-1 text-xs text-gray-500">
                                8 haftalik sotuv rejasi doirasida xususiy maktablar bilan aloqani boshlang.
                            </p>
                            <div className="mt-4">
                                <Button size="sm" onClick={() => setDraft(emptyDraft())} className="min-h-[44px]">
                                    + Yangi maktab qo'shish
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Maktab Qo'shish / Tahrirlash Modali */}
            <Modal isOpen={Boolean(draft)} onClose={() => setDraft(null)} className="max-w-[680px] m-4 p-6 sm:p-8 rounded-2xl">
                {draft && (
                    <div className="space-y-4">
                        <div className="border-b border-gray-100 pb-3 dark:border-gray-800">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                {draft.id ? "Maktab ma'lumotlarini tahrirlash" : "Yangi maktab qo'shish"}
                            </h3>
                            <p className="mt-0.5 text-xs text-gray-500">
                                Xususiy maktab bilan muzokara bosqichi va keyingi qadam sanasi
                            </p>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                            <div>
                                <label htmlFor="school-name" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Maktab nomi *
                                </label>
                                <input
                                    id="school-name"
                                    value={draft.name}
                                    onChange={(e) => setDraft({...draft, name: e.target.value})}
                                    className={INPUT_CLASS}
                                    placeholder="Masalan: Vosiq International"
                                />
                            </div>

                            <div>
                                <label htmlFor="school-city" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Shahar
                                </label>
                                <input
                                    id="school-city"
                                    value={draft.city}
                                    onChange={(e) => setDraft({...draft, city: e.target.value})}
                                    className={INPUT_CLASS}
                                    placeholder="Toshkent"
                                />
                            </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                            <div>
                                <label htmlFor="school-contact" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Direktor / Mas'ul shaxs
                                </label>
                                <input
                                    id="school-contact"
                                    value={draft.contactName}
                                    onChange={(e) => setDraft({...draft, contactName: e.target.value})}
                                    className={INPUT_CLASS}
                                    placeholder="Ismi va lavozimi"
                                />
                            </div>

                            <div>
                                <label htmlFor="school-phone" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Telefon raqami
                                </label>
                                <input
                                    id="school-phone"
                                    value={draft.contactPhone}
                                    onChange={(e) => setDraft({...draft, contactPhone: e.target.value})}
                                    className={INPUT_CLASS}
                                    placeholder="+998 90 123 45 67"
                                />
                            </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-3">
                            <div>
                                <label htmlFor="school-stage" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Joriy bosqich *
                                </label>
                                <select
                                    id="school-stage"
                                    value={draft.stage}
                                    onChange={(e) => setDraft({...draft, stage: e.target.value as SchoolLeadStage})}
                                    className={INPUT_CLASS}
                                >
                                    {STAGES.map((s) => (
                                        <option key={s} value={s}>
                                            {STAGE_LABELS[s]}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label htmlFor="school-students" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    O'quvchilar soni
                                </label>
                                <input
                                    id="school-students"
                                    type="number"
                                    min="0"
                                    value={draft.studentCount}
                                    onChange={(e) => setDraft({...draft, studentCount: e.target.value})}
                                    className={INPUT_CLASS}
                                    placeholder="Masalan: 120"
                                />
                            </div>

                            <div>
                                <label htmlFor="school-fee" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Kutilayotgan oylik narx (so'm)
                                </label>
                                <input
                                    id="school-fee"
                                    type="number"
                                    min="0"
                                    value={draft.monthlyFee}
                                    onChange={(e) => setDraft({...draft, monthlyFee: e.target.value})}
                                    className={INPUT_CLASS}
                                    placeholder="1500000"
                                />
                            </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                            <div>
                                <label htmlFor="school-next-date" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Keyingi qadam sanasi
                                </label>
                                <input
                                    id="school-next-date"
                                    type="date"
                                    value={draft.nextActionDate}
                                    onChange={(e) => setDraft({...draft, nextActionDate: e.target.value})}
                                    className={INPUT_CLASS}
                                />
                            </div>

                            <div>
                                <label htmlFor="school-note" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Qisqa eslatma / Kelishuv
                                </label>
                                <input
                                    id="school-note"
                                    value={draft.note}
                                    onChange={(e) => setDraft({...draft, note: e.target.value})}
                                    className={INPUT_CLASS}
                                    placeholder="Masalan: Juma kuni demo taqdimot"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                            <Button variant="outline" onClick={() => setDraft(null)} className="min-h-[44px]">
                                Bekor qilish
                            </Button>
                            <Button onClick={handleSave} isPending={saveLead.isPending} className="min-h-[44px] shadow-sm active:scale-[0.98]">
                                Saqlash
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
