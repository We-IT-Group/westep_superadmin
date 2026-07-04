import {useState} from "react";
import {ColumnDef} from "@tanstack/react-table";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import CommonTable from "../../components/tables/CommonTable/CommonTable.tsx";
import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import Button from "../../components/ui/button/Button.tsx";
import {Modal} from "../../components/ui/modal";
import StatusToast from "../../components/paymentSettings/StatusToast.tsx";
import apiClient from "../../api/apiClient";

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
}

const emptyDraft = (): HabitDraft => ({id: null, title: "", description: "", ageGroup: "", coinReward: "5"});

export default function HabitsPage() {
    const qc = useQueryClient();
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
            };
            return d.id
                ? (await apiClient.put(`/admin/habits/${d.id}`, body)).data
                : (await apiClient.post("/admin/habits", body)).data;
        },
        onSuccess: () => qc.invalidateQueries({queryKey: ["admin-habits"]}),
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => apiClient.delete(`/admin/habits/${id}`),
        onSuccess: () => qc.invalidateQueries({queryKey: ["admin-habits"]}),
    });

    const handleSave = async () => {
        if (!draft || !draft.title.trim()) {
            setToast({message: "Odat matnini kiriting", type: "error"});
            return;
        }
        try {
            await saveMutation.mutateAsync(draft);
            setToast({message: "Odat saqlandi", type: "success"});
            setDraft(null);
        } catch {
            setToast({message: "Saqlashda xatolik", type: "error"});
        }
    };

    const columns: ColumnDef<HabitDto>[] = [
        {accessorKey: "title", header: "Odat"},
        {
            accessorKey: "ageGroup",
            header: "Yosh guruhi",
            cell: ({row}) => AGE_LABELS[row.original.ageGroup || ""] || row.original.ageGroup,
        },
        {accessorKey: "coinReward", header: "Coin"},
        {
            accessorKey: "active",
            header: "Holat",
            cell: ({row}) => (row.original.active === false ? "O'chiq" : "Aktiv"),
        },
        {
            id: "actions",
            header: "",
            cell: ({row}) => (
                <div className="flex gap-2">
                    <Button size="sm" onClick={() => setDraft({
                        id: row.original.id,
                        title: row.original.title,
                        description: row.original.description || "",
                        ageGroup: row.original.ageGroup || "",
                        coinReward: String(row.original.coinReward),
                    })}>
                        Tahrirlash
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => deleteMutation.mutate(row.original.id)}>
                        O'chirish
                    </Button>
                </div>
            ),
        },
    ];

    const inputClass = "h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";

    return (
        <>
            {toast && <StatusToast message={toast.message} type={toast.type} onClose={() => setToast(null)}/>}
            <PageMeta title="Kunlik odatlar" description="Tarbiya moduli"/>
            <PageBreadcrumb pageTitle="Kunlik odatlar (tarbiya)"/>
            <div className="space-y-6">
                <ComponentCard
                    title="Yaxshi odatlar"
                    desc="Har kuni bolaga bitta vazifa beriladi (rotatsiya bilan). Bola bajarsa, ota-ona PIN bilan tasdiqlaydi va bola coin oladi."
                >
                    <Button size="sm" onClick={() => setDraft(emptyDraft())}>+ Yangi odat</Button>
                    <CommonTable data={habits} columns={columns} isPending={isPending}/>
                </ComponentCard>
            </div>

            <Modal isOpen={Boolean(draft)} onClose={() => setDraft(null)} className="max-w-[560px] m-4 p-6 sm:p-8">
                {draft && (
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                            {draft.id ? "Odatni tahrirlash" : "Yangi odat"}
                        </h3>
                        <input
                            value={draft.title}
                            onChange={(e) => setDraft({...draft, title: e.target.value})}
                            className={inputClass}
                            placeholder="Masalan: Xonangni yig'ishtir"
                        />
                        <textarea
                            value={draft.description}
                            onChange={(e) => setDraft({...draft, description: e.target.value})}
                            rows={3}
                            className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                            placeholder="Qisqa tushuntirish (ixtiyoriy)"
                        />
                        <div className="grid gap-3 sm:grid-cols-2">
                            <select
                                value={draft.ageGroup}
                                onChange={(e) => setDraft({...draft, ageGroup: e.target.value})}
                                className={inputClass}
                            >
                                {Object.entries(AGE_LABELS).map(([value, label]) => (
                                    <option key={value} value={value}>{label}</option>
                                ))}
                            </select>
                            <input
                                type="number" min={1}
                                value={draft.coinReward}
                                onChange={(e) => setDraft({...draft, coinReward: e.target.value})}
                                className={inputClass}
                                placeholder="Coin mukofoti"
                            />
                        </div>
                        <div className="flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setDraft(null)}>Bekor qilish</Button>
                            <Button onClick={handleSave} isPending={saveMutation.isPending}>Saqlash</Button>
                        </div>
                    </div>
                )}
            </Modal>
        </>
    );
}
