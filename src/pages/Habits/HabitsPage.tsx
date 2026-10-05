import {useMemo, useState} from "react";
import {ColumnDef} from "@tanstack/react-table";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import PageMeta from "../../components/common/PageMeta";
import CommonTable from "../../components/tables/CommonTable/CommonTable.tsx";
import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import Button from "../../components/ui/button/Button.tsx";
import {Modal} from "../../components/ui/modal";
import StatusToast from "../../components/paymentSettings/StatusToast.tsx";
import apiClient from "../../api/apiClient";
import {PencilIcon, ShootingStarIcon, TrashBinIcon} from "../../icons";

interface HabitDto {
    id: string;
    title: string;
    description?: string | null;
    ageGroup?: string | null;
    coinReward: number;
    orderIndex?: number;
    active?: boolean;
}

const AGE_LABELS: Record<string, string> = {
    "": "Barcha yoshlar",
    KIDS_5_8: "5–8 yosh",
    JUNIOR_9_12: "9–12 yosh",
    TEEN_13_17: "13–17 yosh",
};

interface HabitDraft {
    id: string | null;
    title: string;
    description: string;
    ageGroup: string;
    coinReward: string;
    active: boolean;
}

const emptyDraft = (): HabitDraft => ({
    id: null,
    title: "",
    description: "",
    ageGroup: "",
    coinReward: "5",
    active: true,
});

export default function HabitsPage() {
    const qc = useQueryClient();
    const [selectedAge, setSelectedAge] = useState<string>("");
    const [draft, setDraft] = useState<HabitDraft | null>(null);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

    const {data: habits = [], isPending} = useQuery({
        queryKey: ["admin-habits"],
        queryFn: async () => (await apiClient.get<HabitDto[]>("/admin/habits")).data,
        retry: false,
    });

    const saveMutation = useMutation({
        mutationFn: async (d: HabitDraft) => {
            const body = {
                title: d.title.trim(),
                description: d.description.trim() || null,
                ageGroup: d.ageGroup || null,
                coinReward: Number(d.coinReward) || 5,
                active: d.active,
            };
            return d.id
                ? (await apiClient.put(`/admin/habits/${d.id}`, body)).data
                : (await apiClient.post("/admin/habits", body)).data;
        },
        onSuccess: () => {
            qc.invalidateQueries({queryKey: ["admin-habits"]});
            setToast({message: "Odat muvaffaqiyatli saqlandi", type: "success"});
            setDraft(null);
        },
        onError: () => setToast({message: "Saqlashda xatolik yuz berdi", type: "error"}),
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => apiClient.delete(`/admin/habits/${id}`),
        onSuccess: () => {
            qc.invalidateQueries({queryKey: ["admin-habits"]});
            setToast({message: "Odat o'chirildi", type: "success"});
        },
        onError: () => setToast({message: "O'chirishda xatolik yuz berdi", type: "error"}),
    });

    const filteredHabits = useMemo(() => {
        if (!selectedAge) return habits;
        return habits.filter((h) => (h.ageGroup || "") === selectedAge);
    }, [habits, selectedAge]);

    // Age counts
    const ageStats = useMemo(() => {
        const counts = {all: habits.length, KIDS_5_8: 0, JUNIOR_9_12: 0, TEEN_13_17: 0};
        habits.forEach((h) => {
            if (h.ageGroup === "KIDS_5_8") counts.KIDS_5_8++;
            else if (h.ageGroup === "JUNIOR_9_12") counts.JUNIOR_9_12++;
            else if (h.ageGroup === "TEEN_13_17") counts.TEEN_13_17++;
        });
        return counts;
    }, [habits]);

    const handleDelete = (id: string, title: string) => {
        if (window.confirm(`"${title}" odatini o'chirishni tasdiqlaysizmi?`)) {
            deleteMutation.mutate(id);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!draft || !draft.title.trim()) {
            setToast({message: "Odat sarlavhasini kiriting", type: "error"});
            return;
        }
        await saveMutation.mutateAsync(draft);
    };

    const columns: ColumnDef<HabitDto>[] = [
        {
            accessorKey: "title",
            header: "Odat nomi",
            cell: ({row}) => (
                <div className="space-y-0.5">
                    <p className="font-medium text-gray-900 dark:text-white">
                        {row.original.title}
                    </p>
                    {row.original.description && (
                        <p className="line-clamp-1 text-xs text-gray-500 dark:text-gray-400">
                            {row.original.description}
                        </p>
                    )}
                </div>
            ),
        },
        {
            accessorKey: "ageGroup",
            header: "Yosh guruhi",
            cell: ({row}) => {
                const val = row.original.ageGroup || "";
                return (
                    <span className="inline-flex items-center rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                        {AGE_LABELS[val] || "Barcha yoshlar"}
                    </span>
                );
            },
        },
        {
            accessorKey: "coinReward",
            header: "Mukofot",
            cell: ({row}) => (
                <span className="inline-flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400">
                    <span>🪙</span>
                    <span>+{row.original.coinReward} coin</span>
                </span>
            ),
        },
        {
            accessorKey: "active",
            header: "Holat",
            cell: ({row}) => {
                const isActive = row.original.active !== false;
                return (
                    <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            isActive
                                ? "bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-300"
                                : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                        }`}
                    >
                        {isActive ? "Faol" : "Nofaol"}
                    </span>
                );
            },
        },
        {
            id: "actions",
            header: "Amallar",
            cell: ({row}) => (
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() =>
                            setDraft({
                                id: row.original.id,
                                title: row.original.title,
                                description: row.original.description || "",
                                ageGroup: row.original.ageGroup || "",
                                coinReward: String(row.original.coinReward),
                                active: row.original.active !== false,
                            })
                        }
                        className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-brand-600 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-brand-400 transition-colors"
                        title="Tahrirlash"
                    >
                        <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => handleDelete(row.original.id, row.original.title)}
                        className="rounded-lg p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-500/10 dark:hover:text-red-400 transition-colors"
                        title="O'chirish"
                    >
                        <TrashBinIcon className="h-4 w-4" />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <>
            {toast && <StatusToast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            <PageMeta title="Kunlik odatlar | Westep Admin" description="Bolalar uchun tarbiya odatlari moduli" />
            <PageBreadcrumb pageTitle="Kunlik odatlar (tarbiya)" />

            <div className="space-y-6">
                {/* Stats Overview */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div className="rounded-xl border border-gray-200/80 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
                        <span className="text-xs text-gray-500 dark:text-gray-400">Jami odatlar</span>
                        <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{ageStats.all}</p>
                    </div>
                    <div className="rounded-xl border border-gray-200/80 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
                        <span className="text-xs text-gray-500 dark:text-gray-400">5–8 yosh</span>
                        <p className="mt-1 text-2xl font-bold text-brand-600 dark:text-brand-400">{ageStats.KIDS_5_8}</p>
                    </div>
                    <div className="rounded-xl border border-gray-200/80 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
                        <span className="text-xs text-gray-500 dark:text-gray-400">9–12 yosh</span>
                        <p className="mt-1 text-2xl font-bold text-blue-600 dark:text-blue-400">{ageStats.JUNIOR_9_12}</p>
                    </div>
                    <div className="rounded-xl border border-gray-200/80 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
                        <span className="text-xs text-gray-500 dark:text-gray-400">13–17 yosh</span>
                        <p className="mt-1 text-2xl font-bold text-purple-600 dark:text-purple-400">{ageStats.TEEN_13_17}</p>
                    </div>
                </div>

                {/* Filter & Action Bar */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
                    {/* Age filter tabs */}
                    <div className="flex flex-wrap items-center gap-1.5">
                        {Object.entries(AGE_LABELS).map(([val, label]) => {
                            const isCurrent = selectedAge === val;
                            return (
                                <button
                                    key={val}
                                    type="button"
                                    onClick={() => setSelectedAge(val)}
                                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                                        isCurrent
                                            ? "bg-brand-500 text-white shadow-sm"
                                            : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                                    }`}
                                >
                                    {label}
                                </button>
                            );
                        })}
                    </div>

                    <Button size="sm" onClick={() => setDraft(emptyDraft())} className="self-start sm:self-auto">
                        <span className="mr-1.5">+</span> Yangi odat qo'shish
                    </Button>
                </div>

                {/* Main Table */}
                <CommonTable data={filteredHabits} columns={columns} isPending={isPending} />
            </div>

            {/* Accessible Add/Edit Modal */}
            <Modal isOpen={Boolean(draft)} onClose={() => setDraft(null)} className="max-w-[540px] m-4 p-6 sm:p-7">
                {draft && (
                    <form onSubmit={handleSave} className="space-y-4">
                        <div className="flex items-center gap-2 border-b border-gray-100 pb-3 dark:border-gray-800">
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
                                <ShootingStarIcon className="h-4 w-4" />
                            </span>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {draft.id ? "Odatni tahrirlash" : "Yangi odat yaratish"}
                            </h3>
                        </div>

                        <div>
                            <label htmlFor="habit-title" className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                                Odat nomi <span className="text-error-500">*</span>
                            </label>
                            <input
                                id="habit-title"
                                type="text"
                                required
                                value={draft.title}
                                onChange={(e) => setDraft({...draft, title: e.target.value})}
                                className="mt-1.5 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-3.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                placeholder="Masalan: Ertalab o'rningni yig'ishtir"
                            />
                        </div>

                        <div>
                            <label htmlFor="habit-desc" className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                                Izoh (ixtiyoriy)
                            </label>
                            <textarea
                                id="habit-desc"
                                rows={3}
                                value={draft.description}
                                onChange={(e) => setDraft({...draft, description: e.target.value})}
                                className="mt-1.5 w-full rounded-lg border border-gray-300 bg-transparent px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                placeholder="Bola nima qilishi kerakligini qisqacha tushuntiring"
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label htmlFor="habit-age" className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                                    Yosh guruhi
                                </label>
                                <select
                                    id="habit-age"
                                    value={draft.ageGroup}
                                    onChange={(e) => setDraft({...draft, ageGroup: e.target.value})}
                                    className="mt-1.5 h-11 w-full rounded-lg border border-gray-300 bg-white px-3.5 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                >
                                    {Object.entries(AGE_LABELS).map(([value, label]) => (
                                        <option key={value} value={value}>
                                            {label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label htmlFor="habit-coin" className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                                    Mukofot (coin) <span className="text-error-500">*</span>
                                </label>
                                <input
                                    id="habit-coin"
                                    type="number"
                                    min={1}
                                    required
                                    value={draft.coinReward}
                                    onChange={(e) => setDraft({...draft, coinReward: e.target.value})}
                                    className="mt-1.5 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-3.5 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                    placeholder="5"
                                />
                            </div>
                        </div>

                        <div className="pt-2 flex items-center justify-between border-t border-gray-100 dark:border-gray-800">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={draft.active}
                                    onChange={(e) => setDraft({...draft, active: e.target.checked})}
                                    className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900"
                                />
                                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                    Odat faol (bolalarga beriladi)
                                </span>
                            </label>

                            <div className="flex items-center gap-2">
                                <Button type="button" variant="outline" onClick={() => setDraft(null)}>
                                    Bekor qilish
                                </Button>
                                <Button type="submit" isPending={saveMutation.isPending}>
                                    Saqlash
                                </Button>
                            </div>
                        </div>
                    </form>
                )}
            </Modal>
        </>
    );
}
