import {FormEvent, useState} from "react";
import {useNavigate} from "react-router";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button.tsx";
import StatusToast from "../../components/paymentSettings/StatusToast.tsx";
import {DownloadIcon, GroupIcon} from "../../icons";
import {
    exportStudentsCsv,
    SignupMethod,
    SubscriptionFilter,
} from "../../api/students/studentApi.ts";
import {useStudentStats, useStudents} from "../../api/students/useStudents.ts";
import {formatRelative, SIGNUP_LABELS, SIGNUP_TONES, SUB_LABELS, SUB_TONES} from "./labels.ts";

const PAGE_SIZE = 20;

function Badge({tone, children}: { tone: string; children: string }) {
    return (
        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${tone}`}>
            {children}
        </span>
    );
}

export default function StudentsPage() {
    const navigate = useNavigate();
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [signupMethod, setSignupMethod] = useState<SignupMethod | "">("");
    const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionFilter>("");
    const [page, setPage] = useState(0);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
    const [exporting, setExporting] = useState(false);

    const {data: stats} = useStudentStats();
    const {data, isPending, isError, error} = useStudents({
        search,
        signupMethod,
        subscriptionStatus,
        page,
        size: PAGE_SIZE,
    });

    const items = data?.items ?? [];
    const total = data?.totalElements ?? 0;
    const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

    const kpis = [
        {label: "Jami", value: stats?.total ?? 0, sub: `+${stats?.newThisWeek ?? 0} bu hafta`},
        {label: "Telefon", value: stats?.phone ?? 0, sub: "SMS / raqam"},
        {label: "Google", value: stats?.google ?? 0, sub: "Google akkaunt"},
        {label: "Telegram", value: stats?.telegram ?? 0, sub: "Telegram login"},
        {label: "To'lovchi", value: stats?.paying ?? 0, sub: "ACTIVE obuna"},
    ];

    const applySearch = (event: FormEvent) => {
        event.preventDefault();
        setPage(0);
        setSearch(searchInput.trim());
    };

    const handleExport = async () => {
        setExporting(true);
        try {
            const blob = await exportStudentsCsv({search, signupMethod, subscriptionStatus});
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = "students.csv";
            link.click();
            URL.revokeObjectURL(url);
            setToast({message: "CSV yuklandi", type: "success"});
        } catch (error) {
            setToast({message: error instanceof Error ? error.message : "CSV yuklanmadi", type: "error"});
        } finally {
            setExporting(false);
        }
    };

    return (
        <div className="mx-auto max-w-7xl">
            {toast && <StatusToast message={toast.message} type={toast.type} onClose={() => setToast(null)}/>}
            <PageMeta title="O'quvchilar" description="O'quvchilar ro'yxati, statistika va kirish usuli"/>

            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">O'quvchilar</h2>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Kirish usuli, obuna va oxirgi faollik
                    </p>
                </div>
                <Button variant="outline" size="sm" onClick={handleExport} disabled={exporting}>
                    <DownloadIcon className="mr-1.5 h-4 w-4"/>
                    CSV
                </Button>
            </div>

            <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-5">
                {kpis.map((kpi) => (
                    <div
                        key={kpi.label}
                        className="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]"
                    >
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">{kpi.label}</p>
                        <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                            {kpi.value.toLocaleString("ru-RU")}
                        </p>
                        <p className="mt-0.5 text-xs text-gray-400">{kpi.sub}</p>
                    </div>
                ))}
            </div>

            <div className="mb-4 flex flex-wrap items-end gap-3 rounded-2xl border border-gray-200/80 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
                <form onSubmit={applySearch} className="min-w-[220px] flex-1">
                    <label htmlFor="student-search" className="mb-1 block text-xs font-semibold text-gray-500">
                        Qidiruv
                    </label>
                    <input
                        id="student-search"
                        value={searchInput}
                        onChange={(event) => setSearchInput(event.target.value)}
                        placeholder="Ism, telefon, ota-ona..."
                        className="h-10 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white"
                    />
                </form>
                <div>
                    <label htmlFor="signup-filter" className="mb-1 block text-xs font-semibold text-gray-500">
                        Kirish
                    </label>
                    <select
                        id="signup-filter"
                        value={signupMethod}
                        onChange={(event) => {
                            setSignupMethod(event.target.value as SignupMethod | "");
                            setPage(0);
                        }}
                        className="h-10 rounded-lg border border-gray-300 bg-transparent px-3 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                    >
                        <option value="">Hammasi</option>
                        <option value="PHONE">Telefon</option>
                        <option value="GOOGLE">Google</option>
                        <option value="TELEGRAM">Telegram</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="sub-filter" className="mb-1 block text-xs font-semibold text-gray-500">
                        Obuna
                    </label>
                    <select
                        id="sub-filter"
                        value={subscriptionStatus}
                        onChange={(event) => {
                            setSubscriptionStatus(event.target.value as SubscriptionFilter);
                            setPage(0);
                        }}
                        className="h-10 rounded-lg border border-gray-300 bg-transparent px-3 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                    >
                        <option value="">Hammasi</option>
                        <option value="ACTIVE">To'lovchi</option>
                        <option value="TRIAL">Sinov</option>
                        <option value="PAST_DUE">Kechikkan</option>
                        <option value="EXPIRED">Tugagan</option>
                        <option value="NONE">Obuna yo'q</option>
                    </select>
                </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
                {isPending ? (
                    <div className="p-8 text-center text-sm text-gray-500">Yuklanmoqda...</div>
                ) : isError ? (
                    <div className="p-8 text-center text-sm text-red-600">
                        {error instanceof Error ? error.message : "O'quvchilar yuklanmadi"}
                    </div>
                ) : items.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 p-12 text-center">
                        <GroupIcon className="h-8 w-8 text-gray-300"/>
                        <p className="font-medium text-gray-700 dark:text-gray-200">O'quvchi topilmadi</p>
                        <p className="text-sm text-gray-400">Qidiruv yoki filterni o'zgartiring</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left text-sm">
                            <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500 dark:bg-white/[0.02] dark:text-gray-400">
                                <tr>
                                    <th className="px-4 py-3">O'quvchi</th>
                                    <th className="px-4 py-3">Kirish</th>
                                    <th className="px-4 py-3">Obuna</th>
                                    <th className="px-4 py-3">Ota-ona</th>
                                    <th className="px-4 py-3">Qurilma</th>
                                    <th className="px-4 py-3">Oxirgi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((student) => {
                                    const status = student.subscriptionStatus || "NONE";
                                    return (
                                        <tr
                                            key={student.id}
                                            onClick={() => navigate(`/students/${student.id}`)}
                                            className="cursor-pointer border-t border-gray-100 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-white/[0.04]"
                                        >
                                            <td className="px-4 py-3">
                                                <p className="font-semibold text-gray-900 dark:text-white">
                                                    {student.firstname} {student.lastname}
                                                </p>
                                                <p className="text-xs text-gray-500">{student.displayPhone}</p>
                                            </td>
                                            <td className="px-4 py-3">
                                                {student.signupMethod ? (
                                                    <Badge tone={SIGNUP_TONES[student.signupMethod]}>
                                                        {SIGNUP_LABELS[student.signupMethod]}
                                                    </Badge>
                                                ) : "—"}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex flex-col gap-0.5">
                                                    <Badge tone={SUB_TONES[status] || SUB_TONES.NONE}>
                                                        {SUB_LABELS[status] || status}
                                                    </Badge>
                                                    {student.planName ? (
                                                        <span className="text-[11px] text-gray-500">{student.planName}</span>
                                                    ) : null}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                                                {student.parentPhone || "—"}
                                            </td>
                                            <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                                                {student.platform || "—"}
                                            </td>
                                            <td className="px-4 py-3 text-gray-500">
                                                {formatRelative(student.lastSeenAt)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {total > PAGE_SIZE ? (
                <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                    <span>{total.toLocaleString("ru-RU")} ta o'quvchi</span>
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={page === 0}
                            onClick={() => setPage((prev) => Math.max(0, prev - 1))}
                        >
                            Oldingi
                        </Button>
                        <span className="px-2 py-1">{page + 1} / {pageCount}</span>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={page + 1 >= pageCount}
                            onClick={() => setPage((prev) => prev + 1)}
                        >
                            Keyingi
                        </Button>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
