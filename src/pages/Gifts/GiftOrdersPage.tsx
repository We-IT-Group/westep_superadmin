import {useMemo, useState} from "react";
import {ColumnDef} from "@tanstack/react-table";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import CommonTable from "../../components/tables/CommonTable/CommonTable.tsx";
import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import Button from "../../components/ui/button/Button.tsx";
import {Modal} from "../../components/ui/modal";
import StatusToast from "../../components/paymentSettings/StatusToast.tsx";
import {GiftOrderDto, GiftOrderStatusValue} from "../../api/gifts/giftApi.ts";
import {useGiftOrders, useSendMysteryGift, useSetGiftOrderStatus} from "../../api/gifts/useGifts.ts";

const STATUS_LABELS: Record<string, string> = {
    NEW: "Yangi",
    APPROVED: "Tasdiqlangan",
    SHIPPED: "Jo'natilgan",
    DELIVERED: "Yetkazilgan",
    REJECTED: "Rad etilgan",
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
    const [size] = useState(20);
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
            setToast({message: `Holat: ${STATUS_LABELS[next]}`, type: "success"});
        } catch (error) {
            setToast({message: error instanceof Error ? error.message : "Xatolik", type: "error"});
        }
    };

    const handleMystery = async () => {
        if (!mysteryStudentId.trim()) {
            setToast({message: "Bola ID sini kiriting", type: "error"});
            return;
        }
        try {
            await sendMystery({studentId: mysteryStudentId.trim(), note: mysteryNote.trim() || undefined});
            setToast({message: "Sirli sovg'a yuborildi 🎁", type: "success"});
            setMysteryOpen(false);
            setMysteryStudentId("");
            setMysteryNote("");
        } catch (error) {
            setToast({message: error instanceof Error ? error.message : "Xatolik", type: "error"});
        }
    };

    const columns: ColumnDef<GiftOrderDto>[] = [
        {
            accessorKey: "giftName",
            header: "Sovg'a",
            cell: ({row}) => `${row.original.mystery ? "🎁 " : ""}${row.original.giftName}`,
        },
        {accessorKey: "studentFullName", header: "Bola"},
        {
            accessorKey: "coinPrice",
            header: "Coin",
            cell: ({row}) => row.original.coinPrice.toLocaleString("uz-UZ"),
        },
        {accessorKey: "contactPhone", header: "Telefon"},
        {accessorKey: "address", header: "Manzil"},
        {
            accessorKey: "status",
            header: "Holat",
            cell: ({row}) => STATUS_LABELS[row.original.status] || row.original.status,
        },
        {
            id: "actions",
            header: "",
            cell: ({row}) => (
                <div className="flex gap-2">
                    {(NEXT_STATUSES[row.original.status] || []).map((next) => (
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
            ),
        },
    ];

    return (
        <>
            {toast && <StatusToast message={toast.message} type={toast.type} onClose={() => setToast(null)}/>}
            <PageMeta title="Sovg'a buyurtmalari" description="Buyurtmalar boshqaruvi"/>
            <PageBreadcrumb pageTitle="Sovg'a buyurtmalari"/>
            <div className="space-y-6">
                <ComponentCard title="Buyurtmalar" desc="Rad etilsa coin va zaxira avtomatik qaytadi">
                    <div className="flex flex-wrap items-center gap-3">
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="h-11 rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                        >
                            <option value="">Barchasi</option>
                            {Object.entries(STATUS_LABELS).map(([value, label]) => (
                                <option key={value} value={value}>{label}</option>
                            ))}
                        </select>
                        <Button size="sm" onClick={() => setMysteryOpen(true)}>🎁 Sirli sovg'a yuborish</Button>
                    </div>
                    <CommonTable data={orders} columns={columns} isPending={isPending}/>
                </ComponentCard>
            </div>

            <Modal isOpen={mysteryOpen} onClose={() => setMysteryOpen(false)} className="max-w-[520px] m-4 p-6 sm:p-8">
                <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Sirli sovg'a 🎁</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Bolaga coin yechilmasdan surpriz sovg'a buyurtmasi yaratiladi va "Sirli sovg'a yo'lda!" push boradi.
                    </p>
                    <input
                        value={mysteryStudentId}
                        onChange={(e) => setMysteryStudentId(e.target.value)}
                        className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                        placeholder="Bola user ID (UUID)"
                    />
                    <textarea
                        value={mysteryNote}
                        onChange={(e) => setMysteryNote(e.target.value)}
                        rows={3}
                        className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                        placeholder="Izoh (masalan: oylik reyting g'olibi)"
                    />
                    <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setMysteryOpen(false)}>Bekor qilish</Button>
                        <Button onClick={handleMystery} isPending={isSending}>Yuborish</Button>
                    </div>
                </div>
            </Modal>
        </>
    );
}
