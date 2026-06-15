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
import ComponentCard from "../../components/common/ComponentCard";
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

function StatusBadge({status}: { status: ScheduledNotificationStatus }) {
    const toneClass = {
        DRAFT: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
        SCHEDULED: "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300",
        SENDING: "bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-300",
        SENT: "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-300",
        CANCELLED: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
        FAILED: "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-300",
    }[status];

    return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${toneClass}`}>{status}</span>;
}

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
                    />
                );
            },
        },
        {accessorKey: "firstname", header: "Ism"},
        {accessorKey: "lastname", header: "Familiya"},
        {accessorKey: "phoneNumber", header: "Telefon"},
    ], [selectedRecipientIds]);

    const scheduledColumns: ColumnDef<ScheduledNotification>[] = useMemo(() => [
        {accessorKey: "title", header: "Sarlavha"},
        {
            accessorKey: "scheduledAt",
            header: "Lokal vaqt",
            cell: ({row}) => formatDateTime(row.original.scheduledAt),
        },
        {
            accessorKey: "status",
            header: "Holat",
            cell: ({row}) => <StatusBadge status={row.original.status}/>,
        },
        {
            accessorKey: "totalRecipients",
            header: "Recipientlar",
            cell: ({row}) => (
                <div className="text-sm text-gray-600 dark:text-gray-300">
                    <div>Jami: {row.original.totalRecipients}</div>
                    <div>Pending: {row.original.pendingRecipients}</div>
                    <div>Sent: {row.original.sentRecipients}</div>
                    <div>Failed: {row.original.failedRecipients}</div>
                </div>
            ),
        },
        {
            id: "actions",
            header: "",
            cell: ({row}) => {
                const canCancel = row.original.status === "SCHEDULED" || row.original.status === "DRAFT";
                if (!canCancel) return null;

                return (
                    <Button
                        size="sm"
                        variant="danger"
                        onClick={() => setCancelTarget(row.original)}
                    >
                        Cancel
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
            title: Yup.string().trim().required("Title kiriting"),
            body: Yup.string().trim().required("Body kiriting"),
            scheduledAt: Yup.string().required("Reja vaqtini kiriting"),
            timezone: Yup.string().trim().required("Timezone kiriting"),
        }),
        onSubmit: async (values, helpers) => {
            if (!selectedRecipientIds.length) {
                setToast({message: "Kamida bitta student tanlang", type: "error"});
                return;
            }

            try {
                await createScheduledNotification({
                    title: values.title.trim(),
                    body: values.body.trim(),
                    scheduledAt: formatScheduledAtForRequest(values.scheduledAt),
                    timezone: values.timezone.trim(),
                    recipientUserIds: selectedRecipientIds,
                });
                helpers.resetForm({
                    values: {
                        title: "",
                        body: "",
                        scheduledAt: "",
                        timezone: DEFAULT_TIMEZONE,
                    },
                });
                setSelectedRecipientIds([]);
                setToast({message: "Notification rejalashtirildi", type: "success"});
            } catch (error) {
                setToast({
                    message: error instanceof Error ? error.message : "Notification rejalashtirilmadi",
                    type: "error",
                });
            }
        },
    });

    const selectedRecipientsCount = selectedRecipientIds.length;
    const recipientPageCount = recipientsResponse ? Math.max(Math.ceil(recipientsResponse.totalElements / recipientsResponse.size), 1) : 1;
    const scheduledPageCount = scheduledResponse ? Math.max(Math.ceil(scheduledResponse.totalElements / scheduledResponse.size), 1) : 1;

    return (
        <>
            {toast && <StatusToast message={toast.message} type={toast.type} onClose={() => setToast(null)}/>}
            <PageMeta title="Scheduled notificationlar" description="Studentlarga rejalashtirilgan notification yuborish"/>
            <PageBreadcrumb pageTitle="Scheduled notificationlar"/>

            <div className="space-y-6">
                <ComponentCard
                    title="Notification rejalashtirish"
                    desc="Student recipientlarni tanlang va notificationni lokal vaqt bilan rejalashtiring."
                >
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            formik.handleSubmit();
                            return false;
                        }}
                        className="space-y-6"
                    >
                        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                            <div>
                                <Label htmlFor="notification-title">Title</Label>
                                <input
                                    id="notification-title"
                                    name="title"
                                    value={formik.values.title}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                                    placeholder="Bugungi dars"
                                />
                                {formik.touched.title && formik.errors.title ? <p className="mt-1.5 text-xs text-error-500">{formik.errors.title}</p> : null}
                            </div>
                            <div>
                                <Label htmlFor="notification-scheduled-at">Scheduled at</Label>
                                <input
                                    id="notification-scheduled-at"
                                    name="scheduledAt"
                                    type="datetime-local"
                                    value={formik.values.scheduledAt}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                                />
                                {formik.touched.scheduledAt && formik.errors.scheduledAt ? <p className="mt-1.5 text-xs text-error-500">{formik.errors.scheduledAt}</p> : null}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                            <div>
                                <Label htmlFor="notification-body">Body</Label>
                                <textarea
                                    id="notification-body"
                                    name="body"
                                    rows={5}
                                    value={formik.values.body}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                                    placeholder="Soat 19:00 da yangi darsni ko'ring."
                                />
                                {formik.touched.body && formik.errors.body ? <p className="mt-1.5 text-xs text-error-500">{formik.errors.body}</p> : null}
                            </div>
                            <div>
                                <Label htmlFor="notification-timezone">Timezone</Label>
                                <input
                                    id="notification-timezone"
                                    name="timezone"
                                    value={formik.values.timezone}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                                />
                                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                    Hozir default timezone: {DEFAULT_TIMEZONE}
                                </p>
                            </div>
                        </div>

                        <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
                            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                                <div className="flex-1 min-w-[260px]">
                                    <Label htmlFor="recipient-search">Student qidirish</Label>
                                    <input
                                        id="recipient-search"
                                        value={recipientSearch}
                                        onChange={(e) => {
                                            setRecipientSearch(e.target.value);
                                            setRecipientPage(0);
                                        }}
                                        className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                                        placeholder="Ism yoki telefon"
                                    />
                                </div>
                                <div className="rounded-lg bg-brand-50 px-4 py-3 text-sm font-medium text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
                                    Tanlangan studentlar: {selectedRecipientsCount}
                                </div>
                            </div>

                            {recipientsError ? (
                                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
                                    {recipientsError instanceof Error ? recipientsError.message : "Recipientlar yuklanmadi"}
                                </div>
                            ) : null}

                            <CommonTable data={recipients} columns={recipientColumns} isPending={recipientsPending}/>

                            <div className="mt-4 flex items-center justify-between gap-3">
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Jami: {recipientsResponse?.totalElements || 0} ta student, sahifa {recipientPage + 1} / {recipientPageCount}
                                </p>
                                <div className="flex items-center gap-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        disabled={recipientPage === 0}
                                        onClick={() => setRecipientPage((prev) => Math.max(prev - 1, 0))}
                                    >
                                        Oldingi
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        disabled={recipientPage + 1 >= recipientPageCount}
                                        onClick={() => setRecipientPage((prev) => prev + 1)}
                                    >
                                        Keyingi
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <Button type="submit" isPending={isCreating} disabled={isCreating}>
                                Rejalashtirish
                            </Button>
                        </div>
                    </form>
                </ComponentCard>

                <ComponentCard
                    title="Scheduled notificationlar"
                    desc="Status bo'yicha filter qiling va kerak bo'lsa rejalashtirilgan yuborishni bekor qiling."
                >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value as ScheduledNotificationStatus | "");
                                setScheduledPage(0);
                            }}
                            className="h-11 rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                        >
                            <option value="">Barcha statuslar</option>
                            <option value="DRAFT">DRAFT</option>
                            <option value="SCHEDULED">SCHEDULED</option>
                            <option value="SENDING">SENDING</option>
                            <option value="SENT">SENT</option>
                            <option value="CANCELLED">CANCELLED</option>
                            <option value="FAILED">FAILED</option>
                        </select>
                        <div className="rounded-lg bg-gray-100 px-4 py-3 text-sm text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                            Jami: {scheduledResponse?.totalElements || 0}
                        </div>
                    </div>

                    {scheduledError ? (
                        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
                            {scheduledError instanceof Error ? scheduledError.message : "Scheduled notificationlar yuklanmadi"}
                        </div>
                    ) : null}

                    <CommonTable data={scheduledItems} columns={scheduledColumns} isPending={scheduledPending}/>

                    <div className="flex items-center justify-between gap-3">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Sahifa {scheduledPage + 1} / {scheduledPageCount}
                        </p>
                        <div className="flex items-center gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                disabled={scheduledPage === 0}
                                onClick={() => setScheduledPage((prev) => Math.max(prev - 1, 0))}
                            >
                                Oldingi
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                disabled={scheduledPage + 1 >= scheduledPageCount}
                                onClick={() => setScheduledPage((prev) => prev + 1)}
                            >
                                Keyingi
                            </Button>
                        </div>
                    </div>
                </ComponentCard>
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
                        setToast({message: "Notification bekor qilindi", type: "success"});
                    } catch (error) {
                        setToast({
                            message: error instanceof Error ? error.message : "Notification bekor qilinmadi",
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
