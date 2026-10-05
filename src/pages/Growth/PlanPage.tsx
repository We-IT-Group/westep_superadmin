import {useMemo, useState} from "react";
import {ColumnDef} from "@tanstack/react-table";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import ComponentCard from "../../components/common/ComponentCard";
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

    // Bugun va kechikkan vazifalar (eng muhimi birinchi)
    const urgentTasks = useMemo(() => {
        return tasks
            .filter((t) => t.dueDate && t.dueDate <= todayStr && t.status !== "DONE")
            .sort((a, b) => (a.dueDate || "").localeCompare(b.dueDate || ""));
    }, [tasks, todayStr]);

    const visible = useMemo(
        () => tasks.filter((t) => (week === 0 || t.week === week) && (!area || t.area === area)),
        [tasks, week, area],
    );

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
        if (!window.confirm(`"${task.title}" vazifasini o'chirishni tasdiqlaysizmi? Bu amalni ortga qaytarib bo'lmaydi.`)) return;
        try {
            await deleteTask.mutateAsync(task.id);
            notify("Vazifa muvaffaqiyatli o'chirildi", "success");
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
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                    {row.original.week}-hafta
                </span>
            ),
        },
        {
            accessorKey: "code",
            header: "Kod",
            cell: ({row}) => (
                <span className="font-mono text-xs font-semibold text-brand-600 dark:text-brand-400">
                    {row.original.code || "—"}
                </span>
            ),
        },
        {
            accessorKey: "title",
            header: "Vazifa",
            cell: ({row}) => (
                <div className="max-w-md py-1">
                    <div className="font-medium text-gray-900 dark:text-white/90">{row.original.title}</div>
                    {row.original.description && (
                        <p className="mt-0.5 text-xs text-gray-500 line-clamp-2 dark:text-gray-400">
                            {row.original.description}
                        </p>
                    )}
                    {row.original.note && (
                        <div className="mt-1 flex items-center gap-1 text-xs text-warning-700 dark:text-warning-400">
                            <span className="font-medium">Izoh:</span> {row.original.note}
                        </div>
                    )}
                </div>
            ),
        },
        {
            accessorKey: "area",
            header: "Yo'nalish",
            cell: ({row}) => (
                <span className="text-xs text-gray-600 dark:text-gray-300 font-medium">
                    {AREA_LABELS[row.original.area]}
                </span>
            ),
        },
        {
            accessorKey: "dueDate",
            header: "Muddat",
            cell: ({row}) => {
                const due = row.original.dueDate;
                if (!due) return <span className="text-gray-400">—</span>;
                const isOverdue = due < todayStr && row.original.status !== "DONE";
                const isToday = due === todayStr && row.original.status !== "DONE";
                return (
                    <span
                        className={`text-xs font-medium px-2 py-0.5 rounded ${
                            isOverdue
                                ? "bg-error-50 text-error-700 dark:bg-error-500/10 dark:text-error-300"
                                : isToday
                                ? "bg-warning-50 text-warning-700 dark:bg-warning-500/10 dark:text-warning-300"
                                : "text-gray-600 dark:text-gray-400"
                        }`}
                    >
                        {due} {isOverdue ? "(kechikdi)" : isToday ? "(bugun)" : ""}
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
                        className="rounded-md border border-gray-300 bg-white px-2 py-1 text-xs text-gray-700 shadow-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
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
                <div className="flex items-center justify-end gap-2">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setDraft(toDraft(row.original))}
                        className="min-h-[36px]"
                    >
                        Tahrirlash
                    </Button>
                    <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDelete(row.original)}
                        className="min-h-[36px]"
                    >
                        O'chirish
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <>
            {toast && <StatusToast message={toast.message} type={toast.type} onClose={() => setToast(null)}/>}
            <PageMeta title="Reja — Boshqaruv markazi" description="8 haftalik sotuv rejasi"/>
            <PageBreadcrumb pageTitle="Reja — 8 hafta"/>

            <div className="space-y-6">
                {/* 1. "Bugun va kechikkanlar" bloki (CEO ertalab birinchi ko'radigan bo'lim) */}
                {urgentTasks.length > 0 && (
                    <div className="rounded-xl border border-warning-200 bg-warning-50/60 p-4 dark:border-warning-500/20 dark:bg-warning-500/5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="inline-flex size-2 rounded-full bg-warning-500 animate-pulse" />
                                <h3 className="font-semibold text-sm text-warning-900 dark:text-warning-200">
                                    Bugun va kechikkan vazifalar ({urgentTasks.length} ta)
                                </h3>
                            </div>
                            <span className="text-xs text-warning-700 dark:text-warning-300 font-medium">
                                Bugungi sana: {todayStr}
                            </span>
                        </div>
                        <div className="mt-3 grid gap-2 sm:grid-cols-2">
                            {urgentTasks.map((t) => (
                                <div
                                    key={t.id}
                                    className="flex items-center justify-between rounded-lg border border-warning-200 bg-white p-3 shadow-xs dark:border-gray-800 dark:bg-gray-900"
                                >
                                    <div className="min-w-0 pr-2">
                                        <div className="flex items-center gap-1.5">
                                            {t.code && (
                                                <span className="font-mono text-xs font-semibold text-brand-600">
                                                    [{t.code}]
                                                </span>
                                            )}
                                            <span className="truncate text-xs font-medium text-gray-900 dark:text-white">
                                                {t.title}
                                            </span>
                                        </div>
                                        <div className="text-[11px] text-gray-500">
                                            Muddat: {t.dueDate} {t.dueDate && t.dueDate < todayStr ? "— Kechikdi" : "— Bugun"}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                        <select
                                            aria-label="Tezkor holat"
                                            value={t.status}
                                            onChange={(e) => handleStatus(t.id, e.target.value as GrowthTaskStatus)}
                                            className="rounded border border-gray-300 bg-transparent px-2 py-1 text-xs dark:border-gray-700"
                                        >
                                            {Object.entries(TASK_STATUS_LABELS).map(([value, label]) => (
                                                <option key={value} value={value}>
                                                    {label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 2. Asosiy reja komponenti */}
                <ComponentCard
                    title="8 haftalik sotuv rejasi"
                    desc="6-oktabr — 29-noyabr. Vazifa holatini qatorda o'zgartiring; muddati kelgan vazifalar har kuni 08:00 da Telegram'ga keladi."
                >
                    {/* Hafta tanlash tablari va kichik progress */}
                    <div className="space-y-3">
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
                                        className={`group relative flex flex-col justify-between rounded-lg border px-3 py-2 text-left transition min-w-[100px] min-h-[44px] ${
                                            isSelected
                                                ? "border-brand-500 bg-brand-50/70 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300"
                                                : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
                                        }`}
                                    >
                                        <div className="flex items-center justify-between text-xs font-medium">
                                            <span>{w === 0 ? "Hammasi" : `${w}-hafta`}</span>
                                            <span className="text-[11px] text-gray-500 dark:text-gray-400">
                                                {done}/{total}
                                            </span>
                                        </div>
                                        <div className="mt-1.5 h-1 w-full rounded-full bg-gray-100 overflow-hidden dark:bg-gray-800">
                                            <div
                                                className={`h-full transition-all ${
                                                    pct === 100 ? "bg-success-500" : "bg-brand-500"
                                                }`}
                                                style={{width: `${pct}%`}}
                                            />
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Filtr va Yangi vazifa qo'shish tugmasi */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                            <div className="flex items-center gap-3">
                                <label htmlFor="area-filter" className="sr-only">
                                    Yo'nalish bo'yicha filtrlash
                                </label>
                                <select
                                    id="area-filter"
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

                            <Button
                                size="sm"
                                onClick={() => setDraft(emptyDraft(week))}
                                className="min-h-[44px]"
                            >
                                + Yangi vazifa
                            </Button>
                        </div>
                    </div>

                    {/* Vazifalar jadvali */}
                    <div className="mt-4">
                        <CommonTable data={visible} columns={columns} isPending={isPending}/>
                        {!isPending && visible.length === 0 && (
                            <div className="p-8 text-center text-sm text-gray-500 dark:text-gray-400">
                                Tanlangan filtr bo'yicha vazifalar mavjud emas. Yangi vazifa qo'shishingiz mumkin.
                            </div>
                        )}
                    </div>
                </ComponentCard>
            </div>

            {/* Qo'shish / Tahrirlash Modali (Barcha maydonlarda ko'rinadigan <label>) */}
            <Modal isOpen={Boolean(draft)} onClose={() => setDraft(null)} className="max-w-[640px] m-4 p-6 sm:p-8">
                {draft && (
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                            {draft.id ? "Vazifani tahrirlash" : "Yangi vazifa qo'shish"}
                        </h3>

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
                                    Kod (ixtiyoriy)
                                </label>
                                <input
                                    id="task-code"
                                    value={draft.code}
                                    onChange={(e) => setDraft({...draft, code: e.target.value})}
                                    className={INPUT_CLASS}
                                    placeholder="Masalan: M4"
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

                        <div className="flex items-center justify-end gap-3 pt-2">
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
        </>
    );
}
