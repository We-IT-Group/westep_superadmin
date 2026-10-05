import {useMemo, useState} from "react";
import {ColumnDef} from "@tanstack/react-table";
import PageMeta from "../../components/common/PageMeta";
import CommonTable from "../../components/tables/CommonTable/CommonTable.tsx";
import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import Button from "../../components/ui/button/Button.tsx";
import {Modal} from "../../components/ui/modal";
import StatusToast from "../../components/paymentSettings/StatusToast.tsx";
import {GiftOrderDto, GiftOrderStatusValue} from "../../api/gifts/giftApi.ts";
import {useGiftOrders, useSendMysteryGift, useSetGiftOrderStatus} from "../../api/gifts/useGifts.ts";
import {BoxIconLine} from "../../icons";

const STATUS_LABELS: Record<string, string> = {
    NEW: "Yangi",
    APPROVED: "Tasdiqlangan",
    SHIPPED: "Jo'natilgan",
    DELIVERED: "Yetkazilgan",
    REJECTED: "Rad etilgan",
};

const STATUS_TONES: Record<string, string> = {
    NEW: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300 border-amber-200 dark:border-amber-500/20",
    APPROVED: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300 border-blue-200 dark:border-blue-500/20",
    SHIPPED: "bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-300 border-purple-200 dark:border-purple-500/20",
    DELIVERED: "bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-300 border-success-200 dark:border-success-500/20",
    REJECTED: "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300 border-red-200 dark:border-red-500/20",
};

const NEXT_STATUSES: Record<string, GiftOrderStatusValue[]> = {
    NEW: ["APPROVED", "REJECTED"],
    APPROVED: ["SHIPPED", "REJECTED"],
    SHIPPED: ["DELIVERED"],
    DELIVERED: [],
    REJECTED: [],
};

export default function GiftOrdersPage() {
    const [status, setStatus] = useState("NEW");
    const [page] = useState(0);
    const [size] = useState(50);
    const [mysteryOpen, setMysteryOpen] = useState(false);
    const [mysteryStudentId, setMysteryStudentId] = useState("");
    const [mysteryNote, setMysteryNote] = useState("");
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

    const {data, isPending} = useGiftOrders(status, page, size);
    const {mutateAsync: setOrderStatus, isPending: isUpdating} = useSetGiftOrderStatus();
    const {mutateAsync: sendMystery, isPending: isSending} = useSendMysteryGift();

    const orders = useMemo(() => data?.content || [], [data?.content]);

    const handleStatus = async (orderId: string, next: GiftOrderStatusValue) => {
        try {
            await setOrderStatus({orderId, status: next});
            setToast({message: `Buyurtma holati: "${STATUS_LABELS[next]}" ga o'zgartirildi`, type: "success"});
        } catch (error) {
            setToast({message: error instanceof Error ? error.message : "Xatolik yuz berdi", type: "error"});
        }
    };

    const handleMystery = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!mysteryStudentId.trim()) {
            setToast({message: "Bola foydalanuvchi ID sini kiriting", type: "error"});
            return;
        }
        try {
            await sendMystery({studentId: mysteryStudentId.trim(), note: mysteryNote.trim() || undefined});
            setToast({message: "Sirli sovg'a yuborildi 🎁", type: "success"});
            setMysteryOpen(false);
            setMysteryStudentId("");
            setMysteryNote("");
        } catch (error) {
            setToast({message: error instanceof Error ? error.message : "Xatolik yuz berdi", type: "error"});
        }
    };

    const columns: ColumnDef<GiftOrderDto>[] = [
        {
            accessorKey: "giftName",
            header: "Sovg'a",
            cell: ({row}) => (
                <div className="flex items-center gap-2">
                    {row.original.mystery && <span className="text-base">🎁</span>}
                    <div>
                        <span className="font-semibold text-gray-900 dark:text-white">
                            {row.original.giftName}
                        </span>
                        {row.original.mystery && (
                            <span className="ml-2 inline-flex items-center rounded bg-purple-50 px-1.5 py-0.5 text-[10px] font-medium text-purple-700 dark:bg-purple-500/10 dark:text-purple-300">
                                Sirli sovg'a
                            </span>
                        )}
                    </div>
                </div>
            ),
        },
        {
            accessorKey: "studentFullName",
            header: "O'quvchi (bola)",
            cell: ({row}) => (
                <span className="font-medium text-gray-900 dark:text-gray-200">
                    {row.original.studentFullName || "Noma'lum"}
                </span>
            ),
        },
        {
            accessorKey: "coinPrice",
            header: "Coin",
            cell: ({row}) => (
                <span className="inline-flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400">
                    <span>🪙</span>
                    <span>{row.original.coinPrice.toLocaleString("uz-UZ")}</span>
                </span>
            ),
        },
        {
            accessorKey: "contactPhone",
            header: "Telefon",
            cell: ({row}) => (
                <span className="text-gray-600 dark:text-gray-400">
                    {row.original.contactPhone || "—"}
                </span>
            ),
        },
        {
            accessorKey: "address",
            header: "Yetkazish manzili",
            cell: ({row}) => (
                <span className="line-clamp-2 max-w-[200px] text-xs text-gray-600 dark:text-gray-400">
                    {row.original.address || "—"}
                </span>
            ),
        },
        {
            accessorKey: "status",
            header: "Holat",
            cell: ({row}) => {
                const s = row.original.status;
                const tone = STATUS_TONES[s] || "bg-gray-100 text-gray-700";
                return (
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${tone}`}>
                        {STATUS_LABELS[s] || s}
                    </span>
                );
            },
        },
        {
            id: "actions",
            header: "Harakatlar",
            cell: ({row}) => {
                const nexts = NEXT_STATUSES[row.original.status] || [];
                if (nexts.length === 0) {
                    return <span className="text-xs text-gray-400 dark:text-gray-600">—</span>;
                }
                return (
                    <div className="flex items-center gap-1.5">
                        {nexts.map((next) => (
                            <Button
                                key={next}
                                size="sm"
                                variant={next === "REJECTED" ? "danger" : "primary"}
                                isPending={isUpdating}
                                onClick={() => handleStatus(row.original.id, next)}
                            >
                                {STATUS_LABELS[next]}
                            </Button>
                        ))}
                    </div>
                );
            },
        },
    ];

    return (
        <>
            {toast && <StatusToast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            <PageMeta title="Sovg'a buyurtmalari | Westep Admin" description="Bolalarning sovg'a buyurtmalarini boshqarish" />
            <PageBreadcrumb pageTitle="Sovg'a buyurtmalari" />

            <div className="space-y-6">
                {/* Header Strip & Mystery Gift Action */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
                    <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-300">
                                <BoxIconLine className="h-4 w-4" />
                            </span>
                            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                                Buyurtmalar oqimi
                            </h2>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Rad etilgan buyurtmalarda bola sarflagan coin va mahsulot zaxirasi avtomatik qaytariladi.
                        </p>
                    </div>

                    <Button size="sm" onClick={() => setMysteryOpen(true)} className="self-start sm:self-auto">
                        <span>🎁</span> <span className="ml-1.5">Sirli sovg'a yuborish</span>
                    </Button>
                </div>

                {/* Pipeline Tabs */}
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
                    {Object.entries(STATUS_LABELS).map(([value, label]) => {
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
                                {label}
                            </button>
                        );
                    })}
                </div>

                {/* Table */}
                <CommonTable data={orders} columns={columns} isPending={isPending} />
            </div>

            {/* Mystery Gift Modal */}
            <Modal isOpen={mysteryOpen} onClose={() => setMysteryOpen(false)} className="max-w-[500px] m-4 p-6 sm:p-7">
                <form onSubmit={handleMystery} className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-gray-100 pb-3 dark:border-gray-800">
                        <span className="text-2xl">🎁</span>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Sirli sovg'a yuborish
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Boladan coin yechilmasdan kutilmagan sovg'a jo'natiladi
                            </p>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="mystery-student-id" className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                            Bola foydalanuvchi ID (UUID) <span className="text-error-500">*</span>
                        </label>
                        <input
                            id="mystery-student-id"
                            type="text"
                            required
                            value={mysteryStudentId}
                            onChange={(e) => setMysteryStudentId(e.target.value)}
                            className="mt-1.5 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-3.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                            placeholder="f47ac10b-58cc-4372-a567-0e02b2c3d479"
                        />
                    </div>

                    <div>
                        <label htmlFor="mystery-note" className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                            Tabrik yoki sabab izohi
                        </label>
                        <textarea
                            id="mystery-note"
                            rows={3}
                            value={mysteryNote}
                            onChange={(e) => setMysteryNote(e.target.value)}
                            className="mt-1.5 w-full rounded-lg border border-gray-300 bg-transparent px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                            placeholder="Masalan: Oylik odatlar chempioni bo'lganing uchun maxsus sovg'a!"
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                        <Button type="button" variant="outline" onClick={() => setMysteryOpen(false)}>
                            Bekor qilish
                        </Button>
                        <Button type="submit" isPending={isSending}>
                            Yuborish
                        </Button>
                    </div>
                </form>
            </Modal>
        </>
    );
}
