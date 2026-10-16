import {useMemo, useState} from "react";
import {ColumnDef} from "@tanstack/react-table";
import PageMeta from "../../components/common/PageMeta";
import CommonTable from "../../components/tables/CommonTable/CommonTable.tsx";
import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import Button from "../../components/ui/button/Button.tsx";
import {Modal} from "../../components/ui/modal";
import StatusToast from "../../components/paymentSettings/StatusToast.tsx";
import {GiftItemDto} from "../../api/gifts/giftApi.ts";
import {useDeleteGiftItem, useGiftItems, useSaveGiftItem} from "../../api/gifts/useGifts.ts";
import {BoxCubeIcon, PencilIcon, TrashBinIcon} from "../../icons";

interface GiftDraft {
    id: string | null;
    name: string;
    description: string;
    coinPrice: string;
    stock: string;
    active: boolean;
}

const emptyDraft = (): GiftDraft => ({
    id: null,
    name: "",
    description: "",
    coinPrice: "",
    stock: "",
    active: true,
});

export default function GiftsPage() {
    const [draft, setDraft] = useState<GiftDraft | null>(null);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

    const {data: items = [], isPending} = useGiftItems();
    const {mutateAsync: save, isPending: isSaving} = useSaveGiftItem();
    const {mutateAsync: remove} = useDeleteGiftItem();

    const stats = useMemo(() => {
        let activeCount = 0;
        let limitedStock = 0;
        items.forEach((item) => {
            if (item.active !== false) activeCount++;
            if (item.stock != null) limitedStock++;
        });
        return {total: items.length, activeCount, limitedStock};
    }, [items]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!draft) return;
        if (!draft.name.trim() || !draft.coinPrice) {
            setToast({message: "Sovg'a nomi va coin narxini kiriting", type: "error"});
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
            setToast({message: "Sovg'a muvaffaqiyatli saqlandi", type: "success"});
            setDraft(null);
        } catch (error) {
            setToast({message: error instanceof Error ? error.message : "Xatolik yuz berdi", type: "error"});
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!window.confirm(`"${name}" sovg'asini katalogdan o'chirishni tasdiqlaysizmi?`)) return;
        try {
            await remove(id);
            setToast({message: "Sovg'a o'chirildi", type: "success"});
        } catch (error) {
            setToast({message: error instanceof Error ? error.message : "O'chirishda xatolik", type: "error"});
        }
    };

    const columns: ColumnDef<GiftItemDto>[] = [
        {
            accessorKey: "name",
            header: "Sovg'a nomi",
            cell: ({row}) => (
                <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-300">
                        <BoxCubeIcon className="h-4 w-4" />
                    </span>
                    <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                            {row.original.name}
                        </p>
                        {row.original.description && (
                            <p className="line-clamp-1 text-xs text-gray-500 dark:text-gray-400">
                                {row.original.description}
                            </p>
                        )}
                    </div>
                </div>
            ),
        },
        {
            accessorKey: "coinPrice",
            header: "Narxi (coin)",
            cell: ({row}) => (
                <span className="inline-flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400">
                    <span>🪙</span>
                    <span>{row.original.coinPrice.toLocaleString("uz-UZ")} coin</span>
                </span>
            ),
        },
        {
            accessorKey: "stock",
            header: "Zaxira",
            cell: ({row}) => {
                const stock = row.original.stock;
                if (stock == null) {
                    return (
                        <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                            Cheksiz
                        </span>
                    );
                }
                const isLow = stock <= 3;
                return (
                    <span
                        className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${
                            isLow
                                ? "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300"
                                : "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300"
                        }`}
                    >
                        {stock} dona {isLow && "(oz qoldi)"}
                    </span>
                );
            },
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
                                name: row.original.name,
                                description: row.original.description || "",
                                coinPrice: String(row.original.coinPrice),
                                stock: row.original.stock != null ? String(row.original.stock) : "",
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
                        onClick={() => handleDelete(row.original.id, row.original.name)}
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
            <PageMeta title="Sovg'alar katalogi | Westep Admin" description="Coin do'koni katalogi va zaxirasi" />
            <PageBreadcrumb pageTitle="Sovg'alar katalogi" />

            <div className="space-y-6">
                {/* Stats Overview */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="rounded-xl border border-gray-200/80 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
                        <span className="text-xs text-gray-500 dark:text-gray-400">Jami sovg'alar</span>
                        <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                    </div>
                    <div className="rounded-xl border border-gray-200/80 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
                        <span className="text-xs text-gray-500 dark:text-gray-400">Faol (do'konda ko'rinadi)</span>
                        <p className="mt-1 text-2xl font-bold text-success-600 dark:text-success-400">{stats.activeCount}</p>
                    </div>
                    <div className="rounded-xl border border-gray-200/80 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
                        <span className="text-xs text-gray-500 dark:text-gray-400">Cheklangan zaxiradagi</span>
                        <p className="mt-1 text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.limitedStock}</p>
                    </div>
                </div>

                {/* Filter and Action Bar */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
                    <div className="space-y-0.5">
                        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                            Katalogdagi tovarlar
                        </h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Bolalar tarbiya odatlarini bajarib to'plagan coinlari evaziga oladigan real sovg'alar
                        </p>
                    </div>
                    <Button size="sm" onClick={() => setDraft(emptyDraft())} className="self-start sm:self-auto">
                        <span className="mr-1.5">+</span> Yangi sovg'a qo'shish
                    </Button>
                </div>

                {/* Main Table */}
                <CommonTable data={items} columns={columns} isPending={isPending} />
            </div>

            {/* Accessible Add/Edit Modal */}
            <Modal isOpen={Boolean(draft)} onClose={() => setDraft(null)} className="max-w-[540px] m-4 p-6 sm:p-7">
                {draft && (
                    <form onSubmit={handleSave} className="space-y-4">
                        <div className="flex items-center gap-2 border-b border-gray-100 pb-3 dark:border-gray-800">
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400">
                                <BoxCubeIcon className="h-4 w-4" />
                            </span>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {draft.id ? "Sovg'ani tahrirlash" : "Yangi sovg'a qo'shish"}
                            </h3>
                        </div>

                        <div>
                            <label htmlFor="gift-name" className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                                Sovg'a nomi <span className="text-error-500">*</span>
                            </label>
                            <input
                                id="gift-name"
                                type="text"
                                required
                                value={draft.name}
                                onChange={(e) => setDraft({...draft, name: e.target.value})}
                                className="mt-1.5 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-3.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                placeholder="Masalan: Aqlli soat (Smart watch)"
                            />
                        </div>

                        <div>
                            <label htmlFor="gift-desc" className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                                Tavsif (ixtiyoriy)
                            </label>
                            <textarea
                                id="gift-desc"
                                rows={3}
                                value={draft.description}
                                onChange={(e) => setDraft({...draft, description: e.target.value})}
                                className="mt-1.5 w-full rounded-lg border border-gray-300 bg-transparent px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                placeholder="Sovg'a xususiyatlari yoki yetkazib berish shartlari"
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label htmlFor="gift-price" className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                                    Narxi (coin) <span className="text-error-500">*</span>
                                </label>
                                <input
                                    id="gift-price"
                                    type="number"
                                    min={1}
                                    required
                                    value={draft.coinPrice}
                                    onChange={(e) => setDraft({...draft, coinPrice: e.target.value})}
                                    className="mt-1.5 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-3.5 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                    placeholder="500000"
                                />
                            </div>

                            <div>
                                <label htmlFor="gift-stock" className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                                    Zaxira soni
                                </label>
                                <input
                                    id="gift-stock"
                                    type="number"
                                    min={0}
                                    value={draft.stock}
                                    onChange={(e) => setDraft({...draft, stock: e.target.value})}
                                    className="mt-1.5 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-3.5 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                    placeholder="Bo'sh qolsa — cheksiz"
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
                                    Sovg'a faol (do'konda ko'rinadi)
                                </span>
                            </label>

                            <div className="flex items-center gap-2">
                                <Button type="button" variant="outline" onClick={() => setDraft(null)}>
                                    Bekor qilish
                                </Button>
                                <Button type="submit" isPending={isSaving}>
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
