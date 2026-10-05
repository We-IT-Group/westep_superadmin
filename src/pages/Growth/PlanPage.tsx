import {useMemo, useState} from "react";
import {ColumnDef} from "@tanstack/react-table";
import PageMeta from "../../components/common/PageMeta";
import CommonTable from "../../components/tables/CommonTable/CommonTable.tsx";
import Button from "../../components/ui/button/Button.tsx";
import Badge from "../../components/ui/badge/Badge";
import {Modal} from "../../components/ui/modal";
import StatusToast from "../../components/paymentSettings/StatusToast.tsx";
import {GrowthArea, GrowthTaskDto, GrowthTaskStatus} from "../../api/growth/growthApi.ts";
import {
    useDeleteGrowthTask,
    useGrowthTasks,
    useSaveGrowthTask,
    useSetGrowthTaskStatus,
} from "../../api/growth/useGrowth.ts";
import {
    AREA_LABELS,
    INPUT_CLASS,
    isoDate,
    TASK_STATUS_COLORS,
    TASK_STATUS_LABELS,
    TEXTAREA_CLASS,
} from "./labels.ts";
import GrowthNav from "./components/GrowthNav.tsx";

interface TaskDraft {
    id: string | null;
    week: string;
    area: GrowthArea;
    code: string;
    title: string;
    description: string;
    status: GrowthTaskStatus;
    dueDate: string;
    note: string;
    orderIndex: number;
}

const WEEKS = [1, 2, 3, 4, 5, 6, 7, 8];

const emptyDraft = (week: number): TaskDraft => ({
    id: null,
    week: String(week && week >= 1 && week <= 8 ? week : 1),
    area: "PRODUCT",
    code: "",
    title: "",
    description: "",
    status: "TODO",
    dueDate: "",
    note: "",
    orderIndex: 0,
});

const toDraft = (task: GrowthTaskDto): TaskDraft => ({
    id: task.id,
    week: String(task.week),
    area: task.area,
    code: task.code || "",
    title: task.title,
    description: task.description || "",
    status: task.status,
    dueDate: task.dueDate || "",
    note: task.note || "",
    orderIndex: task.orderIndex,
});

export default function PlanPage() {
    const {data: tasks = [], isPending} = useGrowthTasks();
    const saveTask = useSaveGrowthTask();
    const setStatus = useSetGrowthTaskStatus();
    const deleteTask = useDeleteGrowthTask();

    const [week, setWeek] = useState(0);
    const [area, setArea] = useState<GrowthArea | "">("");
    const [draft, setDraft] = useState<TaskDraft | null>(null);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

    const todayStr = useMemo(() => isoDate(new Date()), []);

    // Bugun va kechikkan vazifalar
    const urgentTasks = useMemo(() => {
        return tasks
            .filter((t) => t.dueDate && t.dueDate <= todayStr && t.status !== "DONE")
            .sort((a, b) => (a.dueDate || "").localeCompare(b.dueDate || ""));
    }, [tasks, todayStr]);

    const visible = useMemo(
        () => tasks.filter((t) => (week === 0 || t.week === week) && (!area || t.area === area)),
        [tasks, week, area],
    );

    const overallDone = useMemo(() => tasks.filter((t) => t.status === "DONE").length, [tasks]);
    const overallBlocked = useMemo(() => tasks.filter((t) => t.status === "BLOCKED").length, [tasks]);

    const progressCount = (w: number) => {
        const list = w === 0 ? tasks : tasks.filter((t) => t.week === w);
        const done = list.filter((t) => t.status === "DONE").length;
        return {done, total: list.length};
    };

    const notify = (message: string, type: "success" | "error") => setToast({message, type});

    const handleStatus = async (id: string, newStatus: GrowthTaskStatus) => {
        try {
            await setStatus.mutateAsync({id, status: newStatus});
            notify("Vazifa holati yangilandi", "success");
        } catch (e) {
            notify((e as Error).message, "error");
        }
    };

    const handleDelete = async (task: GrowthTaskDto) => {
        if (!window.confirm(`"${task.title}" vazifasini o'chirishni tasdiqlaysizmi?`)) return;
        try {
            await deleteTask.mutateAsync(task.id);
            notify("Vazifa o'chirildi", "success");
        } catch (e) {
            notify((e as Error).message, "error");
        }
    };

    const handleSave = async () => {
        if (!draft) return;
        const weekNumber = Number(draft.week);
        if (!draft.title.trim() || weekNumber < 1 || weekNumber > 8) {
            notify("Vazifa nomi va hafta raqami (1–8) majburiy", "error");
            return;
        }
        try {
            await saveTask.mutateAsync({
                id: draft.id,
                body: {
                    week: weekNumber,
                    area: draft.area,
                    code: draft.code.trim() || null,
                    title: draft.title.trim(),
                    description: draft.description.trim() || null,
                    status: draft.status,
                    dueDate: draft.dueDate || null,
                    note: draft.note.trim() || null,
                    orderIndex: draft.orderIndex,
                },
            });
            notify(draft.id ? "Vazifa yangilandi" : "Yangi vazifa saqlandi", "success");
            setDraft(null);
        } catch (e) {
            notify((e as Error).message, "error");
        }
    };

    const columns: ColumnDef<GrowthTaskDto>[] = [
        {
            accessorKey: "week",
            header: "Hafta",
            cell: ({row}) => (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                    {row.original.week}-hafta
                </span>
            ),
        },
        {
            accessorKey: "code",
            header: "Kod",
            cell: ({row}) => (
                <span className="font-mono text-xs font-bold text-brand-600 dark:text-brand-400">
                    {row.original.code || "—"}
                </span>
            ),
        },
        {
            accessorKey: "title",
            header: "Vazifa tafsiloti",
            cell: ({row}) => (
                <div className="max-w-md py-1.5">
                    <div className="font-medium text-sm text-gray-900 dark:text-white">
                        {row.original.title}
                    </div>
                    {row.original.description && (
                        <p className="mt-0.5 text-xs text-gray-500 line-clamp-2 dark:text-gray-400">
                            {row.original.description}
                        </p>
                    )}
                    {row.original.note && (
                        <div className="mt-1 flex items-center gap-1.5 rounded bg-warning-50 px-2 py-0.5 text-xs font-medium text-warning-800 dark:bg-warning-500/10 dark:text-warning-300 w-fit">
                            <span>⚠️ Izoh:</span> {row.original.note}
                        </div>
                    )}
                </div>
            ),
        },
        {
            accessorKey: "area",
            header: "Yo'nalish",
            cell: ({row}) => (
                <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                    {AREA_LABELS[row.original.area]}
                </span>
            ),
        },
        {
            accessorKey: "dueDate",
            header: "Muddat",
            cell: ({row}) => {
                const due = row.original.dueDate;
                if (!due) return <span className="text-gray-400 text-xs">—</span>;
                const isOverdue = due < todayStr && row.original.status !== "DONE";
                const isToday = due === todayStr && row.original.status !== "DONE";
                return (
                    <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                            isOverdue
                                ? "bg-error-50 text-error-700 dark:bg-error-500/10 dark:text-error-300"
                                : isToday
                                ? "bg-warning-50 text-warning-700 dark:bg-warning-500/10 dark:text-warning-300"
                                : "text-gray-600 dark:text-gray-400"
                        }`}
                    >
                        {due} {isOverdue ? "· Kechikdi" : isToday ? "· Bugun" : ""}
                    </span>
                );
            },
        },
        {
            accessorKey: "status",
            header: "Holat",
            cell: ({row}) => (
                <div className="flex items-center gap-2">
                    <Badge size="sm" color={TASK_STATUS_COLORS[row.original.status]}>
                        {TASK_STATUS_LABELS[row.original.status]}
                    </Badge>
                    <select
                        aria-label="Holatni o'zgartirish"
                        value={row.original.status}
                        onChange={(e) => handleStatus(row.original.id, e.target.value as GrowthTaskStatus)}
                        className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700 shadow-xs focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 transition"
                    >
                        {Object.entries(TASK_STATUS_LABELS).map(([value, label]) => (
                            <option key={value} value={value}>
                                {label}
                            </option>
                        ))}
                    </select>
                </div>
            ),
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
            <PageMeta title="Reja — 8 haftalik sotuv rejasi" description="8 haftalik sotuv rejasi"/>

            <GrowthNav
                title="8 haftalik sotuv rejasi"
                subtitle="Reja davri: 6-oktabr — 29-noyabr, 2026. Har kuni 08:00 da muddati kelgan vazifalar Telegram'ga yuboriladi."
                action={
                    <Button
                        size="sm"
                        onClick={() => setDraft(emptyDraft(week))}
                        className="min-h-[44px] shadow-sm active:scale-[0.98]"
                    >
                        + Yangi vazifa qo'shish
                    </Button>
                }
            />

            {/* Quick KPI stats strip */}
            <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-xl border border-gray-200 bg-white p-3.5 shadow-xs dark:border-gray-800 dark:bg-gray-900/60">
                    <div className="text-xs text-gray-500">Jami vazifalar</div>
                    <div className="mt-1 text-xl font-bold text-gray-900 dark:text-white">{tasks.length} ta</div>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-3.5 shadow-xs dark:border-gray-800 dark:bg-gray-900/60">
                    <div className="text-xs text-success-600">Bajarildi</div>
                    <div className="mt-1 text-xl font-bold text-success-700 dark:text-success-400">
                        {overallDone} ta ({tasks.length > 0 ? Math.round((overallDone / tasks.length) * 100) : 0}%)
                    </div>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-3.5 shadow-xs dark:border-gray-800 dark:bg-gray-900/60">
                    <div className="text-xs text-warning-600">Bugun / Kechikkan</div>
                    <div className="mt-1 text-xl font-bold text-warning-700 dark:text-warning-400">
                        {urgentTasks.length} ta
                    </div>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-3.5 shadow-xs dark:border-gray-800 dark:bg-gray-900/60">
                    <div className="text-xs text-error-600">To'xtab qolgan</div>
                    <div className="mt-1 text-xl font-bold text-error-700 dark:text-error-400">
                        {overallBlocked} ta
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                {/* 1. "Bugun va kechikkan vazifalar" bloki (CEO ertalab birinchi ko'radigan qism) */}
                {urgentTasks.length > 0 && (
                    <div className="rounded-2xl border border-warning-200 bg-gradient-to-r from-warning-50/80 to-amber-50/40 p-5 shadow-xs dark:border-warning-500/20 dark:from-warning-500/10 dark:to-transparent">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <span className="relative flex size-2.5">
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-warning-400 opacity-75" />
                                    <span className="relative inline-flex size-2.5 rounded-full bg-warning-500" />
                                </span>
                                <h3 className="font-semibold text-sm text-warning-950 dark:text-warning-200">
                                    Bugun va kechikkan vazifalar ({urgentTasks.length} ta)
                                </h3>
                            </div>
                            <span className="text-xs font-semibold text-warning-800 dark:text-warning-300">
                                {todayStr}
                            </span>
                        </div>

                        <div className="mt-3.5 grid gap-2.5 sm:grid-cols-2">
                            {urgentTasks.map((t) => (
                                <div
                                    key={t.id}
                                    className="flex items-center justify-between rounded-xl border border-warning-200/80 bg-white p-3.5 shadow-xs dark:border-gray-800 dark:bg-gray-900"
                                >
                                    <div className="min-w-0 pr-3">
                                        <div className="flex items-center gap-2">
                                            {t.code && (
                                                <span className="font-mono text-xs font-bold text-brand-600 dark:text-brand-400">
                                                    [{t.code}]
                                                </span>
                                            )}
                                            <span className="truncate text-xs font-semibold text-gray-900 dark:text-white">
                                                {t.title}
                                            </span>
                                        </div>
                                        <div className="mt-1 flex items-center gap-2 text-[11px] text-gray-500">
                                            <span>Muddat: {t.dueDate}</span>
                                            <span className="text-warning-700 font-medium">
                                                {t.dueDate && t.dueDate < todayStr ? "— Kechikdi" : "— Bugun"}
                                            </span>
                                        </div>
                                    </div>
                                    <select
                                        aria-label="Holatni tezkor almashtirish"
                                        value={t.status}
                                        onChange={(e) => handleStatus(t.id, e.target.value as GrowthTaskStatus)}
                                        className="rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-700 shadow-xs focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                                    >
                                        {Object.entries(TASK_STATUS_LABELS).map(([value, label]) => (
                                            <option key={value} value={value}>
                                                {label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 2. Asosiy reja komponenti */}
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs dark:border-gray-800 dark:bg-white/[0.02]">
                    {/* Hafta tanlash tablari va qulay progress */}
                    <div className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                            {[0, ...WEEKS].map((w) => {
                                const {done, total} = progressCount(w);
                                const isSelected = week === w;
                                const pct = total > 0 ? Math.round((done / total) * 100) : 0;
                                return (
                                    <button
                                        key={w}
                                        type="button"
                                        onClick={() => setWeek(w)}
                                        className={`group relative flex flex-col justify-between rounded-xl border px-3.5 py-2.5 text-left transition-all min-w-[105px] min-h-[50px] active:scale-[0.98] ${
                                            isSelected
                                                ? "border-brand-500 bg-brand-50/70 text-brand-700 shadow-xs ring-1 ring-brand-500/30 dark:bg-brand-500/10 dark:text-brand-300"
                                                : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50/50 dark:border-gray-800 dark:bg-gray-900/60 dark:text-gray-300 dark:hover:bg-gray-800"
                                        }`}
                                    >
                                        <div className="flex items-center justify-between text-xs font-semibold">
                                            <span>{w === 0 ? "Hammasi" : `${w}-hafta`}</span>
                                            <span className="text-[11px] font-normal text-gray-500 dark:text-gray-400">
                                                {done}/{total}
                                            </span>
                                        </div>
                                        <div className="mt-2 h-1.5 w-full rounded-full bg-gray-100 overflow-hidden dark:bg-gray-800">
                                            <div
                                                className={`h-full transition-all duration-300 ${
                                                    pct === 100 ? "bg-success-500" : "bg-brand-500"
                                                }`}
                                                style={{width: `${pct}%`}}
                                            />
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Filtr va Yangi vazifa tugmasi */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500 font-medium">Yo'nalish:</span>
                                <select
                                    aria-label="Yo'nalish bo'yicha filtrlash"
                                    value={area}
                                    onChange={(e) => setArea(e.target.value as GrowthArea | "")}
                                    className={`${INPUT_CLASS} max-w-[220px]`}
                                >
                                    <option value="">Barcha yo'nalishlar</option>
                                    {Object.entries(AREA_LABELS).map(([value, label]) => (
                                        <option key={value} value={value}>
                                            {label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <span className="text-xs text-gray-400">
                                Ko'rsatilmoqda: <span className="font-semibold text-gray-700 dark:text-gray-300">{visible.length} ta</span> vazifa
                            </span>
                        </div>
                    </div>

                    {/* Vazifalar jadvali */}
                    <div className="mt-5">
                        <CommonTable data={visible} columns={columns} isPending={isPending}/>
                        {!isPending && visible.length === 0 && (
                            <div className="p-12 text-center text-sm text-gray-500 dark:text-gray-400">
                                Tanlangan filtr bo'yicha hech qanday vazifa topilmadi.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Qo'shish / Tahrirlash Modali */}
            <Modal isOpen={Boolean(draft)} onClose={() => setDraft(null)} className="max-w-[640px] m-4 p-6 sm:p-8 rounded-2xl">
                {draft && (
                    <div className="space-y-4">
                        <div className="border-b border-gray-100 pb-3 dark:border-gray-800">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                {draft.id ? "Vazifani tahrirlash" : "Yangi vazifa qo'shish"}
                            </h3>
                            <p className="mt-0.5 text-xs text-gray-500">
                                8 haftalik sotuv rejasiga yangi maqsad yoki operatsion vazifa biriktiring
                            </p>
                        </div>

                        <div>
                            <label htmlFor="task-title" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Vazifa nomi *
                            </label>
                            <input
                                id="task-title"
                                value={draft.title}
                                onChange={(e) => setDraft({...draft, title: e.target.value})}
                                className={INPUT_CLASS}
                                placeholder="Masalan: Diagnostika savollarini tekshirish"
                            />
                        </div>

                        <div className="grid gap-3 sm:grid-cols-3">
                            <div>
                                <label htmlFor="task-week" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Hafta *
                                </label>
                                <select
                                    id="task-week"
                                    value={draft.week}
                                    onChange={(e) => setDraft({...draft, week: e.target.value})}
                                    className={INPUT_CLASS}
                                >
                                    {WEEKS.map((w) => (
                                        <option key={w} value={w}>
                                            {w}-hafta
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label htmlFor="task-area" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Yo'nalish *
                                </label>
                                <select
                                    id="task-area"
                                    value={draft.area}
                                    onChange={(e) => setDraft({...draft, area: e.target.value as GrowthArea})}
                                    className={INPUT_CLASS}
                                >
                                    {Object.entries(AREA_LABELS).map(([value, label]) => (
                                        <option key={value} value={value}>
                                            {label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label htmlFor="task-code" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Kod (masalan M4)
                                </label>
                                <input
                                    id="task-code"
                                    value={draft.code}
                                    onChange={(e) => setDraft({...draft, code: e.target.value})}
                                    className={INPUT_CLASS}
                                    placeholder="M4"
                                />
                            </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                            <div>
                                <label htmlFor="task-due-date" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Muddat (DueDate)
                                </label>
                                <input
                                    id="task-due-date"
                                    type="date"
                                    value={draft.dueDate}
                                    onChange={(e) => setDraft({...draft, dueDate: e.target.value})}
                                    className={INPUT_CLASS}
                                />
                            </div>

                            <div>
                                <label htmlFor="task-status" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Holat
                                </label>
                                <select
                                    id="task-status"
                                    value={draft.status}
                                    onChange={(e) => setDraft({...draft, status: e.target.value as GrowthTaskStatus})}
                                    className={INPUT_CLASS}
                                >
                                    {Object.entries(TASK_STATUS_LABELS).map(([value, label]) => (
                                        <option key={value} value={value}>
                                            {label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="task-desc" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Batafsil tavsif (ixtiyoriy)
                            </label>
                            <textarea
                                id="task-desc"
                                value={draft.description}
                                rows={3}
                                onChange={(e) => setDraft({...draft, description: e.target.value})}
                                className={TEXTAREA_CLASS}
                                placeholder="Nima qilinishi kerak, qanday mezon bo'yicha baholanadi..."
                            />
                        </div>

                        <div>
                            <label htmlFor="task-note" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Qayd / To'siq izohi
                            </label>
                            <textarea
                                id="task-note"
                                value={draft.note}
                                rows={2}
                                onChange={(e) => setDraft({...draft, note: e.target.value})}
                                className={TEXTAREA_CLASS}
                                placeholder="Joriy holat, to'siq yoki qo'shimcha eslatma..."
                            />
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                            <Button variant="outline" onClick={() => setDraft(null)} className="min-h-[44px]">
                                Bekor qilish
                            </Button>
                            <Button onClick={handleSave} isPending={saveTask.isPending} className="min-h-[44px]">
                                Saqlash
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
