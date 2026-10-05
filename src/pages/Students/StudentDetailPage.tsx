import {ReactNode} from "react";
import {Link, useParams} from "react-router";
import PageMeta from "../../components/common/PageMeta";
import {useStudent} from "../../api/students/useStudents.ts";
import {
    formatDateTime,
    formatSom,
    genderLabel,
    SIGNUP_LABELS,
    SIGNUP_TONES,
    SUB_LABELS,
    SUB_TONES,
} from "./labels.ts";

function Badge({tone, children}: { tone: string; children: string }) {
    return (
        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${tone}`}>
            {children}
        </span>
    );
}

function Card({title, children}: { title: string; children: ReactNode }) {
    return (
        <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">{title}</h3>
            {children}
        </div>
    );
}

function Row({label, value}: { label: string; value?: string | number | null }) {
    return (
        <div className="flex justify-between gap-4 py-1.5 text-sm">
            <span className="text-gray-500">{label}</span>
            <span className="text-right font-medium text-gray-900 dark:text-white">{value || "—"}</span>
        </div>
    );
}

export default function StudentDetailPage() {
    const {id} = useParams();
    const {data, isPending, error} = useStudent(id);

    return (
        <div className="mx-auto max-w-5xl">
            <PageMeta title={data ? `${data.firstname} ${data.lastname}` : "O'quvchi"} description="O'quvchi kartochkasi"/>
            <Link to="/students" className="mb-4 inline-block text-sm font-medium text-brand-600 hover:underline">
                ← O'quvchilar
            </Link>

            {isPending ? (
                <p className="text-sm text-gray-500">Yuklanmoqda...</p>
            ) : error || !data ? (
                <p className="text-sm text-error-600">{error instanceof Error ? error.message : "O'quvchi topilmadi"}</p>
            ) : (
                <div className="space-y-4">
                    <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {data.firstname} {data.lastname}
                                </h2>
                                <p className="mt-1 text-sm text-gray-500">
                                    {data.displayPhone}
                                    {data.age != null ? ` · ${data.age} yosh` : ""}
                                    {` · ${genderLabel(data.gender)}`}
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {data.signupMethod ? (
                                    <Badge tone={SIGNUP_TONES[data.signupMethod]}>{SIGNUP_LABELS[data.signupMethod]}</Badge>
                                ) : null}
                                {data.subscriptions[0] ? (
                                    <Badge tone={SUB_TONES[data.subscriptions[0].trial ? "TRIAL" : data.subscriptions[0].status] || SUB_TONES.NONE}>
                                        {data.subscriptions[0].trial
                                            ? "Sinov"
                                            : (SUB_LABELS[data.subscriptions[0].status] || data.subscriptions[0].status)}
                                    </Badge>
                                ) : (
                                    <Badge tone={SUB_TONES.NONE}>Obuna yo'q</Badge>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <Card title="Profil">
                            <Row label="Ota-ona" value={data.parentPhone}/>
                            <Row label="Tug'ilgan" value={data.birthDate}/>
                            <Row label="Til" value={data.preferredLanguageCode}/>
                            <Row label="Telegram" value={data.telegramUsername ? `@${data.telegramUsername}` : null}/>
                            <Row label="Telefon tasdiqlangan" value={data.phoneVerified ? "Ha" : "Yo'q"}/>
                            <Row label="Ro'yxat" value={formatDateTime(data.createdAt)}/>
                        </Card>
                        <Card title="Obuna">
                            {data.subscriptions.length === 0 ? (
                                <p className="text-sm text-gray-400">Obuna yo'q</p>
                            ) : (
                                data.subscriptions.map((sub) => (
                                    <div key={sub.id} className="mb-3 border-b border-gray-100 pb-3 last:mb-0 last:border-0 last:pb-0 dark:border-gray-800">
                                        <Row label="Tarif" value={sub.planName}/>
                                        <Row label="Holat" value={sub.trial ? "Sinov" : SUB_LABELS[sub.status] || sub.status}/>
                                        <Row label="Avto-yechish" value={sub.autoRenew ? "Yoqilgan" : "O'chiq"}/>
                                        <Row label="Muddat" value={`${formatDateTime(sub.currentPeriodStart)} — ${formatDateTime(sub.currentPeriodEnd)}`}/>
                                    </div>
                                ))
                            )}
                        </Card>
                        <Card title="Qurilmalar">
                            {data.devices.length === 0 ? (
                                <p className="text-sm text-gray-400">Sessiya yo'q</p>
                            ) : (
                                data.devices.map((device) => (
                                    <div key={device.id} className="mb-2 text-sm last:mb-0">
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {device.platform || "Qurilma"} {device.deviceName ? `· ${device.deviceName}` : ""}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {device.active ? "Faol" : "Yopilgan"} · {formatDateTime(device.lastSeenAt)}
                                        </p>
                                    </div>
                                ))
                            )}
                        </Card>
                        <Card title="To'lovlar">
                            {data.payments.length === 0 ? (
                                <p className="text-sm text-gray-400">To'lov yo'q</p>
                            ) : (
                                data.payments.map((payment) => (
                                    <div key={payment.id} className="mb-2 flex justify-between text-sm last:mb-0">
                                        <span className="text-gray-600 dark:text-gray-300">
                                            {formatSom(payment.amountSom)} · {payment.status}
                                        </span>
                                        <span className="text-xs text-gray-400">{formatDateTime(payment.createdAt)}</span>
                                    </div>
                                ))
                            )}
                        </Card>
                    </div>
                </div>
            )}
        </div>
    );
}
