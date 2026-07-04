import {useState} from "react";
import {ColumnDef} from "@tanstack/react-table";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import CommonTable from "../../components/tables/CommonTable/CommonTable.tsx";
import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import Button from "../../components/ui/button/Button.tsx";
import {Modal} from "../../components/ui/modal";
import StatusToast from "../../components/paymentSettings/StatusToast.tsx";
import {GiftItemDto} from "../../api/gifts/giftApi.ts";
import {useDeleteGiftItem, useGiftItems, useSaveGiftItem} from "../../api/gifts/useGifts.ts";

interface GiftDraft {
    id: string | null;
    name: string;
    description: string;
    coinPrice: string;
    stock: string;
    active: boolean;
}

const emptyDraft = (): GiftDraft => ({id: null, name: "", description: "", coinPrice: "", stock: "", active: true});

export default function GiftsPage() {
    const [draft, setDraft] = useState<GiftDraft | null>(null);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

    const {data: items = [], isPending} = useGiftItems();
    const {mutateAsync: save, isPending: isSaving} = useSaveGiftItem();
    const {mutateAsync: remove} = useDeleteGiftItem();

    const handleSave = async () => {
        if (!draft) return;
        if (!draft.name.trim() || !draft.coinPrice) {
            setToast({message: "Nom va coin narxini kiriting", type: "error"});
            return;
        }
        try {
            await save({
                id: draft.id,
                body: {
                    name: draft.name.trim(),
                    description: draft.description.trim() || null,
                    coinPrice: Number(draft.coinPrice),
                    stock: draft.stock ? Number(draft.stock) : null,
                    active: draft.active,
                },
            });
            setToast({message: "Sovg'a saqlandi", type: "success"});
            setDraft(null);
        } catch (error) {
            setToast({message: error instanceof Error ? error.message : "Xatolik", type: "error"});
        }
    };

    const columns: ColumnDef<GiftItemDto>[] = [
        {accessorKey: "name", header: "Sovg'a"},
        {
            accessorKey: "coinPrice",
            header: "Narxi (coin)",
            cell: ({row}) => row.original.coinPrice.toLocaleString("uz-UZ"),
        },
        {
            accessorKey: "stock",
            header: "Zaxira",
            cell: ({row}) => row.original.stock ?? "Cheksiz",
        },
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
                        name: row.original.name,
                        description: row.original.description || "",
                        coinPrice: String(row.original.coinPrice),
                        stock: row.original.stock != null ? String(row.original.stock) : "",
                        active: row.original.active !== false,
                    })}>
                        Tahrirlash
                    </Button>
                    <Button size="sm" variant="danger" onClick={async () => {
                        try {
                            await remove(row.original.id);
                            setToast({message: "Sovg'a o'chirildi", type: "success"});
                        } catch (error) {
                            setToast({message: error instanceof Error ? error.message : "Xatolik", type: "error"});
                        }
                    }}>
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
            <PageMeta title="Sovg'alar katalogi" description="Coin do'koni katalogi"/>
            <PageBreadcrumb pageTitle="Sovg'alar katalogi"/>
            <div className="space-y-6">
                <ComponentCard title="Katalog" desc="Bolalar coin evaziga oladigan real sovg'alar (masalan, soat = 500 000 coin)">
                    <Button size="sm" onClick={() => setDraft(emptyDraft())}>+ Yangi sovg'a</Button>
                    <CommonTable data={items} columns={columns} isPending={isPending}/>
                </ComponentCard>
            </div>

            <Modal isOpen={Boolean(draft)} onClose={() => setDraft(null)} className="max-w-[560px] m-4 p-6 sm:p-8">
                {draft && (
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                            {draft.id ? "Sovg'ani tahrirlash" : "Yangi sovg'a"}
                        </h3>
                        <input
                            value={draft.name}
                            onChange={(e) => setDraft({...draft, name: e.target.value})}
                            className={inputClass}
                            placeholder="Sovg'a nomi (Smart soat)"
                        />
                        <textarea
                            value={draft.description}
                            onChange={(e) => setDraft({...draft, description: e.target.value})}
                            rows={3}
                            className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                            placeholder="Tavsif"
                        />
                        <div className="grid gap-3 sm:grid-cols-2">
                            <input
                                type="number" min={1}
                                value={draft.coinPrice}
                                onChange={(e) => setDraft({...draft, coinPrice: e.target.value})}
                                className={inputClass}
                                placeholder="Narxi (coin) — 500000"
                            />
                            <input
                                type="number" min={0}
                                value={draft.stock}
                                onChange={(e) => setDraft({...draft, stock: e.target.value})}
                                className={inputClass}
                                placeholder="Zaxira (bo'sh = cheksiz)"
                            />
                        </div>
                        <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                            <input
                                type="checkbox"
                                checked={draft.active}
                                onChange={(e) => setDraft({...draft, active: e.target.checked})}
                            />
                            Aktiv (bolalarga ko'rinadi)
                        </label>
                        <div className="flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setDraft(null)}>Bekor qilish</Button>
                            <Button onClick={handleSave} isPending={isSaving}>Saqlash</Button>
                        </div>
                    </div>
                )}
            </Modal>
        </>
    );
}
