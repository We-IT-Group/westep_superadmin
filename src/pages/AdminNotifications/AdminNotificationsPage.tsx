import {useMemo, useState} from "react";
import {useFormik} from "formik";
import * as Yup from "yup";
import {ColumnDef} from "@tanstack/react-table";
import {
    useCancelScheduledNotification,
    useCreateScheduledNotification,
    useGetScheduledNotifications,
    useGetStudentRecipients
} from "../../api/adminNotifications/useAdminNotification.ts";
import DeleteModal from "../../components/common/DeleteModal.tsx";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Label from "../../components/form/Label.tsx";
import StatusToast from "../../components/paymentSettings/StatusToast.tsx";
import CommonTable from "../../components/tables/CommonTable/CommonTable.tsx";
import Button from "../../components/ui/button/Button.tsx";
import {
    NotificationRecipient,
    ScheduledNotification,
    ScheduledNotificationFormValues,
    ScheduledNotificationStatus
} from "../../types/types.ts";
import {PaperPlaneIcon} from "../../icons";

const DEFAULT_TIMEZONE = "Asia/Tashkent";
const PAGE_SIZE = 20;

function formatDateTime(value?: string | null) {
    if (!value) return "—";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return parsed.toLocaleString("uz-UZ");
}

function formatScheduledAtForRequest(value: string) {
    if (!value) return value;
    return value.length === 16 ? `${value}:00` : value;
}

const STATUS_CONFIG: Record<ScheduledNotificationStatus, { label: string; tone: string }> = {
    DRAFT: {
        label: "Qoralama",
        tone: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700",
    },
    SCHEDULED: {
        label: "Rejalashtirilgan",
        tone: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300 border-blue-200 dark:border-blue-500/20",
    },
    SENDING: {
        label: "Yuborilmoqda",
        tone: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300 border-amber-200 dark:border-amber-500/20",
    },
    SENT: {
        label: "Yetkazildi",
        tone: "bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-300 border-success-200 dark:border-success-500/20",
    },
    CANCELLED: {
        label: "Bekor qilingan",
        tone: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700",
    },
    FAILED: {
        label: "Xatolik",
        tone: "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300 border-red-200 dark:border-red-500/20",
    },
};

export default function AdminNotificationsPage() {
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

    const [recipientSearch, setRecipientSearch] = useState("");
    const [recipientPage, setRecipientPage] = useState(0);
    const [selectedRecipientIds, setSelectedRecipientIds] = useState<string[]>([]);

    const [statusFilter, setStatusFilter] = useState<ScheduledNotificationStatus | "">("SCHEDULED");
    const [scheduledPage, setScheduledPage] = useState(0);
    const [cancelTarget, setCancelTarget] = useState<ScheduledNotification | null>(null);

    const {
        data: recipientsResponse,
        isPending: recipientsPending,
        error: recipientsError,
    } = useGetStudentRecipients({
        search: recipientSearch,
        page: recipientPage,
        size: PAGE_SIZE,
    });

    const {
        data: scheduledResponse,
        isPending: scheduledPending,
        error: scheduledError,
    } = useGetScheduledNotifications({
        status: statusFilter,
        page: scheduledPage,
        size: PAGE_SIZE,
    });

    const {mutateAsync: createScheduledNotification, isPending: isCreating} = useCreateScheduledNotification();
    const {mutateAsync: cancelScheduledNotification, isPending: isCancelling} = useCancelScheduledNotification();

    const recipients = recipientsResponse?.items || [];
    const scheduledItems = scheduledResponse?.items || [];

    const recipientColumns: ColumnDef<NotificationRecipient>[] = useMemo(() => [
        {
            id: "select",
            header: "",
            cell: ({row}) => {
                const checked = selectedRecipientIds.includes(row.original.id);
                return (
                    <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                            setSelectedRecipientIds((prev) =>
                                checked
                                    ? prev.filter((id) => id !== row.original.id)
                                    : [...prev, row.original.id],
                            );
                        }}
                        className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900"
                    />
                );
            },
        },
        {accessorKey: "firstname", header: "Ismi"},
        {accessorKey: "lastname", header: "Familiyasi"},
        {accessorKey: "phoneNumber", header: "Telefon raqami"},
    ], [selectedRecipientIds]);

    const scheduledColumns: ColumnDef<ScheduledNotification>[] = useMemo(() => [
        {
            accessorKey: "title",
            header: "Xabarnoma",
            cell: ({row}) => (
                <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                        {row.original.title}
                    </p>
                    <p className="line-clamp-1 text-xs text-gray-500 dark:text-gray-400">
                        {row.original.body}
                    </p>
                </div>
            ),
        },
        {
            accessorKey: "scheduledAt",
            header: "Rejalashtirilgan vaqt",
            cell: ({row}) => (
                <span className="text-xs text-gray-700 dark:text-gray-300">
                    {formatDateTime(row.original.scheduledAt)}
                </span>
            ),
        },
        {
            accessorKey: "status",
            header: "Holat",
            cell: ({row}) => {
                const conf = STATUS_CONFIG[row.original.status] || {
                    label: row.original.status,
                    tone: "bg-gray-100 text-gray-700",
                };
                return (
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${conf.tone}`}>
                        {conf.label}
                    </span>
                );
            },
        },
        {
            accessorKey: "totalRecipients",
            header: "Qamrov",
            cell: ({row}) => (
                <div className="text-xs text-gray-600 dark:text-gray-400">
                    <span className="font-medium text-gray-900 dark:text-white">
                        {row.original.totalRecipients} ta
                    </span>
                    <span className="ml-1 text-[11px] text-gray-400">
                        ({row.original.sentRecipients} yuborildi)
                    </span>
                </div>
            ),
        },
        {
            id: "actions",
            header: "Amallar",
            cell: ({row}) => {
                if (row.original.status !== "SCHEDULED") return <span className="text-xs text-gray-400">—</span>;
                return (
                    <Button
                        size="sm"
                        variant="danger"
                        onClick={() => setCancelTarget(row.original)}
                    >
                        Bekor qilish
                    </Button>
                );
            },
        },
    ], []);

    const formik = useFormik<ScheduledNotificationFormValues>({
        initialValues: {
            title: "",
            body: "",
            scheduledAt: "",
            timezone: DEFAULT_TIMEZONE,
        },
        validationSchema: Yup.object({
            title: Yup.string().trim().required("Sarlavhani kiriting"),
            body: Yup.string().trim().required("Matnni kiriting"),
            scheduledAt: Yup.string().required("Vaqtni tanlang"),
            timezone: Yup.string().required("Timezoneni kiriting"),
        }),
        onSubmit: async (values, {resetForm}) => {
            if (selectedRecipientIds.length === 0) {
                setToast({
                    message: "Kamida bitta studentni tanlang",
                    type: "error",
                });
                return;
            }

            try {
                await createScheduledNotification({
                    title: values.title.trim(),
                    body: values.body.trim(),
                    scheduledAt: formatScheduledAtForRequest(values.scheduledAt),
                    timezone: values.timezone.trim() || DEFAULT_TIMEZONE,
                    recipientUserIds: selectedRecipientIds,
                });
                setToast({
                    message: "Notification rejalashtirildi",
                    type: "success",
                });
                resetForm();
                setSelectedRecipientIds([]);
                setRecipientSearch("");
                setRecipientPage(0);
            } catch (error) {
                setToast({
                    message: error instanceof Error ? error.message : "Notification rejalashtirilmadi",
                    type: "error",
                });
            }
        },
    });

    const recipientPageCount = Math.max(1, Math.ceil((recipientsResponse?.totalElements || 0) / PAGE_SIZE));
    const scheduledPageCount = Math.max(1, Math.ceil((scheduledResponse?.totalElements || 0) / PAGE_SIZE));
    const selectedRecipientsCount = selectedRecipientIds.length;

    return (
        <>
            {toast && <StatusToast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            <PageMeta title="Bildirishnomalar | Westep Admin" description="Rejalashtirilgan push bildirishnomalar" />
            <PageBreadcrumb pageTitle="Bildirishnomalar" />

            <div className="space-y-6">
                {/* Header Information Strip */}
                <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
                    <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
                            <PaperPlaneIcon className="h-5 w-5" />
                        </span>
                        <div>
                            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                                Push Bildirishnomalar Markazi
                            </h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                O'quvchilarga kerakli sana va vaqtda avtomatik yetib boradigan tizimli push xabarnomalar
                            </p>
                        </div>
                    </div>
                </div>

                {/* Form to Schedule a Notification */}
                <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white border-b border-gray-100 pb-3 dark:border-gray-800">
                        Yangi bildirishnoma rejalashtirish
                    </h3>

                    <form onSubmit={formik.handleSubmit} className="mt-4 space-y-5">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <Label htmlFor="notification-title">
                                    Sarlavha <span className="text-error-500">*</span>
                                </Label>
                                <input
                                    id="notification-title"
                                    name="title"
                                    value={formik.values.title}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    className="mt-1.5 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-3.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                    placeholder="Masalan: Bugungi tarbiya vazifasi tayyor!"
                                />
                                {formik.touched.title && formik.errors.title ? (
                                    <p className="mt-1 text-xs text-error-500">{formik.errors.title}</p>
                                ) : null}
                            </div>

                            <div>
                                <Label htmlFor="notification-scheduled-at">
                                    Yuborish vaqti <span className="text-error-500">*</span>
                                </Label>
                                <input
                                    id="notification-scheduled-at"
                                    name="scheduledAt"
                                    type="datetime-local"
                                    value={formik.values.scheduledAt}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    className="mt-1.5 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-3.5 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                />
                                {formik.touched.scheduledAt && formik.errors.scheduledAt ? (
                                    <p className="mt-1 text-xs text-error-500">{formik.errors.scheduledAt}</p>
                                ) : null}
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="notification-body">
                                Xabar matni (Body) <span className="text-error-500">*</span>
                            </Label>
                            <textarea
                                id="notification-body"
                                name="body"
                                rows={3}
                                value={formik.values.body}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                className="mt-1.5 w-full rounded-lg border border-gray-300 bg-transparent px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                placeholder="Ilovaga kiring va bugungi odatni bajarib 5 coin oling."
                            />
                            {formik.touched.body && formik.errors.body ? (
                                <p className="mt-1 text-xs text-error-500">{formik.errors.body}</p>
                            ) : null}
                        </div>

                        {/* Recipient Selection Sub-block */}
                        <div className="rounded-xl border border-gray-200/80 p-4 dark:border-gray-800">
                            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                                <div className="flex-1 min-w-[260px]">
                                    <Label htmlFor="recipient-search">O'quvchini qidirish</Label>
                                    <input
                                        id="recipient-search"
                                        value={recipientSearch}
                                        onChange={(e) => {
                                            setRecipientSearch(e.target.value);
                                            setRecipientPage(0);
                                        }}
                                        className="mt-1.5 h-10 w-full rounded-lg border border-gray-300 bg-transparent px-3.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                        placeholder="Ism yoki telefon..."
                                    />
                                </div>
                                <div className="rounded-lg bg-brand-50 px-3.5 py-2 text-xs font-semibold text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
                                    Tanlangan o'quvchilar: {selectedRecipientsCount} nafar
                                </div>
                            </div>

                            {recipientsError ? (
                                <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
                                    {recipientsError instanceof Error ? recipientsError.message : "O'quvchilar yuklanmadi"}
                                </div>
                            ) : null}

                            <CommonTable data={recipients} columns={recipientColumns} isPending={recipientsPending} />

                            <div className="mt-3 flex items-center justify-between gap-3 text-xs text-gray-500 dark:text-gray-400">
                                <span>
                                    Jami: {recipientsResponse?.totalElements || 0} ta o'quvchi
                                </span>
                                <div className="flex items-center gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        disabled={recipientPage === 0}
                                        onClick={() => setRecipientPage((prev) => Math.max(prev - 1, 0))}
                                    >
                                        Oldingi
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        disabled={recipientPage + 1 >= recipientPageCount}
                                        onClick={() => setRecipientPage((prev) => prev + 1)}
                                    >
                                        Keyingi
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-2">
                            <Button type="submit" isPending={isCreating} disabled={isCreating}>
                                <PaperPlaneIcon className="h-4 w-4 mr-1.5" />
                                Bildirishnomani rejalashtirish
                            </Button>
                        </div>
                    </form>
                </div>

                {/* Scheduled Notifications History Table */}
                <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-3 dark:border-gray-800">
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                            Rejadagi va yuborilgan xabarnomalar
                        </h3>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                            Jami: {scheduledResponse?.totalElements || 0} ta
                        </div>
                    </div>

                    {/* Filter Tabs */}
                    <div className="mt-4 flex flex-wrap items-center gap-1.5 pb-2">
                        <button
                            type="button"
                            onClick={() => {
                                setStatusFilter("");
                                setScheduledPage(0);
                            }}
                            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                                statusFilter === ""
                                    ? "bg-brand-500 text-white shadow-sm"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                            }`}
                        >
                            Barchasi
                        </button>
                        {Object.entries(STATUS_CONFIG).map(([value, conf]) => {
                            const isCurrent = statusFilter === value;
                            return (
                                <button
                                    key={value}
                                    type="button"
                                    onClick={() => {
                                        setStatusFilter(value as ScheduledNotificationStatus);
                                        setScheduledPage(0);
                                    }}
                                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                                        isCurrent
                                            ? "bg-brand-500 text-white shadow-sm"
                                            : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                                    }`}
                                >
                                    {conf.label}
                                </button>
                            );
                        })}
                    </div>

                    {scheduledError ? (
                        <div className="my-3 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
                            {scheduledError instanceof Error ? scheduledError.message : "Xabarnomalar yuklanmadi"}
                        </div>
                    ) : null}

                    <CommonTable data={scheduledItems} columns={scheduledColumns} isPending={scheduledPending} />

                    <div className="mt-4 flex items-center justify-between gap-3 text-xs text-gray-500 dark:text-gray-400">
                        <span>
                            Sahifa {scheduledPage + 1} / {scheduledPageCount}
                        </span>
                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={scheduledPage === 0}
                                onClick={() => setScheduledPage((prev) => Math.max(prev - 1, 0))}
                            >
                                Oldingi
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={scheduledPage + 1 >= scheduledPageCount}
                                onClick={() => setScheduledPage((prev) => prev + 1)}
                            >
                                Keyingi
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <DeleteModal
                open={Boolean(cancelTarget)}
                setOpen={(open) => {
                    if (!open) setCancelTarget(null);
                }}
                isPending={isCancelling}
                deleteFunction={async () => {
                    if (!cancelTarget) return;
                    try {
                        await cancelScheduledNotification(cancelTarget.id);
                        setToast({message: "Bildirishnoma bekor qilindi", type: "success"});
                    } catch (error) {
                        setToast({
                            message: error instanceof Error ? error.message : "Bildirishnoma bekor qilinmadi",
                            type: "error",
                        });
                    } finally {
                        setCancelTarget(null);
                    }
                }}
            />
        </>
    );
}
