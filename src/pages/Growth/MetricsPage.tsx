import {useMemo, useState} from "react";
import {ColumnDef} from "@tanstack/react-table";
import Chart from "react-apexcharts";
import {ApexOptions} from "apexcharts";
import PageMeta from "../../components/common/PageMeta";
import CommonTable from "../../components/tables/CommonTable/CommonTable.tsx";
import Button from "../../components/ui/button/Button.tsx";
import StatusToast from "../../components/paymentSettings/StatusToast.tsx";
import {GrowthFunnelDto, GrowthSourceStatDto} from "../../api/growth/growthApi.ts";
import {useGrowthSummary, useSendGrowthBrief} from "../../api/growth/useGrowth.ts";
import {formatSom, LEARNER_SEGMENT_LABELS, percent} from "./labels.ts";
import GrowthNav from "./components/GrowthNav.tsx";

type FunnelRow = GrowthFunnelDto & { label: string };

const sourceColumns: ColumnDef<GrowthSourceStatDto>[] = [
    {
        accessorKey: "source",
        header: "Manba / Promo-kod",
        cell: ({row}) => (
            <span className="font-semibold text-gray-900 dark:text-white">
                {row.original.source || "Noma'lum manba"}
            </span>
        ),
    },
    {
        accessorKey: "registrations",
        header: "Ro'yxatdan o'tganlar",
        cell: ({row}) => row.original.registrations.toLocaleString("ru-RU"),
    },
    {
        accessorKey: "payingFamilies",
        header: "To'lovchi oilalar",
        cell: ({row}) => {
            const pct = percent(row.original.payingFamilies, row.original.registrations);
            return (
                <div className="flex items-center gap-2">
                    <span className="font-bold text-success-700 dark:text-success-400">
                        {row.original.payingFamilies} ta
                    </span>
                    <span className="rounded-full bg-success-50 px-2 py-0.5 text-[11px] font-semibold text-success-700 dark:bg-success-500/10 dark:text-success-300">
                        {pct}
                    </span>
                </div>
            );
        },
    },
    {
        accessorKey: "revenueSom",
        header: "Tushum",
        cell: ({row}) => (
            <span className="font-bold text-gray-900 dark:text-white">
                {formatSom(row.original.revenueSom)}
            </span>
        ),
    },
];

interface GoalCardProps {
    title: string;
    value: number;
    min: number;
    goal: number;
    format: (n: number) => string;
    sublabel: string;
    unit: string;
}

/**
 * ESDA QOLARLI ELEMENT: "Maqsadga yo'l" kartasi
 * CEO ertalab 10 soniyada minimum va maqsadga yetish darajasini aniq ko'radi.
 */
function GoalHeroCard({title, value, min, goal, format, sublabel, unit}: GoalCardProps) {
    const width = goal > 0 ? Math.min(100, Math.round((value / goal) * 100)) : 0;
    const minMark = goal > 0 ? Math.min(100, Math.round((min / goal) * 100)) : 0;
    const reachedMin = value >= min;
    const reachedGoal = value >= goal;

    const remainingToMin = Math.max(0, min - value);
    const remainingToGoal = Math.max(0, goal - value);

    return (
        <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-b from-white to-gray-50/50 p-6 shadow-xs dark:border-gray-800 dark:from-gray-900 dark:to-gray-900/60">
            <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    {title}
                </span>
                <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        reachedGoal
                            ? "bg-success-100 text-success-800 dark:bg-success-500/20 dark:text-success-300"
                            : reachedMin
                            ? "bg-brand-50 text-brand-700 dark:bg-brand-500/20 dark:text-brand-300"
                            : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                    }`}
                >
                    {reachedGoal
                        ? "🎉 Maqsad bajarildi!"
                        : reachedMin
                        ? "✅ Minimum marraga yetildi"
                        : `${width}% bajarildi`}
                </span>
            </div>

            <div className="mt-4 flex items-baseline gap-2">
                <span className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                    {format(value)}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                    / maqsad {format(goal)}
                </span>
            </div>

            {/* Qulay vizual progress bar + Minimum belgisi */}
            <div className="relative mt-5 h-3.5 w-full rounded-full bg-gray-100 dark:bg-gray-800">
                <div
                    className={`h-full rounded-full transition-all duration-500 ${
                        reachedMin ? "bg-gradient-to-r from-brand-500 to-success-500" : "bg-brand-500"
                    }`}
                    style={{width: `${Math.max(2, width)}%`}}
                />
                {/* Minimum marra chizig'i (sariq vertikal marker) */}
                <div
                    className="absolute top-[-5px] bottom-[-5px] w-[3px] rounded-full bg-warning-500 ring-2 ring-white dark:ring-gray-900"
                    style={{left: `${minMark}%`}}
                    title={`Minimum chegara: ${format(min)}`}
                />
            </div>

            {/* Marralar tag yozuvlari */}
            <div className="mt-3 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 font-medium">
                <div className="flex items-center gap-1.5 text-warning-700 dark:text-warning-300 font-semibold">
                    <span className="size-2 rounded-full bg-warning-500 inline-block" />
                    <span>Min: {format(min)}</span>
                </div>
                <div>{sublabel}</div>
                <div className="font-semibold text-gray-800 dark:text-gray-200">
                    Maqsad: {format(goal)}
                </div>
            </div>

            {/* Status xulosasi */}
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs">
                <span className="text-gray-500">
                    {!reachedMin
                        ? `Minimumgacha yana ${format(remainingToMin)} ${unit} qoldi`
                        : !reachedGoal
                        ? `Asosiy maqsadgacha yana ${format(remainingToGoal)} ${unit} qoldi`
                        : "Barcha ko'rsatkichlar oshig'i bilan bajarildi"}
                </span>
                <span className="text-gray-400">8 hafta rejasi</span>
            </div>
        </div>
    );
}

const funnelColumns: ColumnDef<FunnelRow>[] = [
    {
        accessorKey: "label",
        header: "Davr / Segment",
        cell: ({row}) => (
            <span className="font-semibold text-gray-900 dark:text-white">
                {row.original.label}
            </span>
        ),
    },
    {
        accessorKey: "registrations",
        header: "Ro'yxat",
        cell: ({row}) => row.original.registrations.toLocaleString("ru-RU"),
    },
    {
        accessorKey: "diagnostics",
        header: "Diagnostika",
        cell: ({row}) => (
            <div>
                <span className="font-medium">{row.original.diagnostics}</span>
                <span className="ml-1.5 text-xs text-gray-400">
                    ({percent(row.original.diagnostics, row.original.registrations)})
                </span>
            </div>
        ),
    },
    {
        accessorKey: "returned7d",
        header: "7-kun qaytish",
        cell: ({row}) => (
            <div>
                <span className="font-medium">{row.original.returned7d}</span>
                <span className="ml-1.5 text-xs text-gray-400">
                    ({percent(row.original.returned7d, row.original.registrations)})
                </span>
            </div>
        ),
    },
    {
        accessorKey: "trials",
        header: "Sinov (7 kun)",
        cell: ({row}) => row.original.trials.toLocaleString("ru-RU"),
    },
    {
        accessorKey: "payingFamilies",
        header: "To'lov",
        cell: ({row}) => (
            <div className="flex items-center gap-1.5">
                <span className="font-bold text-success-700 dark:text-success-400">
                    {row.original.payingFamilies}
                </span>
                <span className="rounded bg-success-50 px-1.5 py-0.5 text-[11px] font-semibold text-success-700 dark:bg-success-500/10 dark:text-success-300">
                    {percent(row.original.payingFamilies, row.original.registrations)}
                </span>
            </div>
        ),
    },
    {
        accessorKey: "revenueSom",
        header: "Tushum",
        cell: ({row}) => (
            <span className="font-bold text-gray-900 dark:text-white">
                {formatSom(row.original.revenueSom)}
            </span>
        ),
    },
];

export default function MetricsPage() {
    const {data, isPending, error} = useGrowthSummary();
    const sendBrief = useSendGrowthBrief();
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

    const handleSendBrief = async () => {
        try {
            await sendBrief.mutateAsync();
            setToast({
                message: "Ertalabki hisobot Telegram admin kanaliga yuborildi",
                type: "success",
            });
        } catch (e) {
            setToast({message: (e as Error).message, type: "error"});
        }
    };

    const weekRows: FunnelRow[] = useMemo(() => {
        return (data?.weeks ?? []).map((w, i) => ({
            ...w,
            label: `${i + 1}-hafta (${w.from} – ${w.to})`,
        }));
    }, [data?.weeks]);

    const segmentRows: FunnelRow[] = useMemo(() => {
        if (!data) return [];
        const declared = data.bySegment.map((s) => ({
            ...s,
            label: s.segment ? LEARNER_SEGMENT_LABELS[s.segment] : "—",
        }));
        const segmentTotalReg = data.bySegment.reduce((a, s) => a + s.registrations, 0);
        const segmentTotalDiag = data.bySegment.reduce((a, s) => a + s.diagnostics, 0);
        const segmentTotalRet7d = data.bySegment.reduce((a, s) => a + s.returned7d, 0);
        const segmentTotalTrials = data.bySegment.reduce((a, s) => a + s.trials, 0);
        const segmentTotalPay = data.bySegment.reduce((a, s) => a + s.payingFamilies, 0);
        const segmentTotalRev = data.bySegment.reduce((a, s) => a + s.revenueSom, 0);

        return [
            ...declared,
            {
                ...data.totals,
                label: "Segment tanlamagan",
                registrations: Math.max(0, data.totals.registrations - segmentTotalReg),
                diagnostics: Math.max(0, data.totals.diagnostics - segmentTotalDiag),
                returned7d: Math.max(0, data.totals.returned7d - segmentTotalRet7d),
                trials: Math.max(0, data.totals.trials - segmentTotalTrials),
                payingFamilies: Math.max(0, data.totals.payingFamilies - segmentTotalPay),
                revenueSom: Math.max(0, data.totals.revenueSom - segmentTotalRev),
            },
        ];
    }, [data]);

    const segmentComparison = useMemo(() => {
        if (!data || data.bySegment.length < 2) return null;
        const seg58 = data.bySegment.find((s) => s.segment === "GRADES_5_8");
        const seg911 = data.bySegment.find((s) => s.segment === "GRADES_9_11");
        if (!seg58 || !seg911) return null;

        const rate58 = seg58.registrations > 0 ? (seg58.payingFamilies / seg58.registrations) * 100 : 0;
        const rate911 = seg911.registrations > 0 ? (seg911.payingFamilies / seg911.registrations) * 100 : 0;

        let leader: "GRADES_5_8" | "GRADES_9_11" | "EQUAL" = "EQUAL";
        if (seg58.payingFamilies > seg911.payingFamilies) leader = "GRADES_5_8";
        else if (seg911.payingFamilies > seg58.payingFamilies) leader = "GRADES_9_11";
        else if (rate58 > rate911) leader = "GRADES_5_8";
        else if (rate911 > rate58) leader = "GRADES_9_11";

        return {seg58, seg911, leader, rate58, rate911};
    }, [data]);

    // Haftalik dinamika grafigi
    const chartOptions: ApexOptions = useMemo(() => {
        const categories = (data?.weeks ?? []).map((_, i) => `${i + 1}-hafta`);
        return {
            chart: {
                type: "area",
                height: 250,
                toolbar: {show: false},
                fontFamily: "inherit",
            },
            colors: ["#3b82f6", "#10b981"],
            fill: {
                type: "gradient",
                gradient: {
                    shadeIntensity: 1,
                    opacityFrom: 0.35,
                    opacityTo: 0.05,
                    stops: [0, 95, 100],
                },
            },
            dataLabels: {enabled: false},
            stroke: {curve: "smooth", width: 2.5},
            xaxis: {
                categories: categories.length > 0 ? categories : ["1-hafta", "2-hafta", "3-hafta", "4-hafta"],
                labels: {style: {fontSize: "12px", colors: "#6b7280"}},
            },
            yaxis: {
                labels: {style: {fontSize: "12px", colors: "#6b7280"}},
            },
            legend: {position: "top", horizontalAlign: "right"},
            grid: {borderColor: "#e5e7eb", strokeDashArray: 3},
            tooltip: {theme: "light"},
        };
    }, [data?.weeks]);

    const chartSeries = useMemo(() => {
        const weeks = data?.weeks ?? [];
        return [
            {
                name: "Ro'yxatdan o'tganlar",
                data: weeks.map((w) => w.registrations),
            },
            {
                name: "To'lovchi oilalar",
                data: weeks.map((w) => w.payingFamilies),
            },
        ];
    }, [data?.weeks]);

    return (
        <div className="mx-auto max-w-7xl">
            {toast && <StatusToast message={toast.message} type={toast.type} onClose={() => setToast(null)}/>}
            <PageMeta title="Ko'rsatkichlar — 8 haftalik sotuv maqsadlari" description="Funnel va 8 haftalik maqsadlar"/>

            <GrowthNav
                title="Sotuv va Konversiya ko'rsatkichlari"
                subtitle="Funnel bosqichlari, haftalik tushum va ikki segment natijalari"
                action={
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={handleSendBrief}
                        isPending={sendBrief.isPending}
                        className="min-h-[44px] shadow-xs active:scale-[0.98]"
                    >
                        ✈️ Ertalabki hisobotni hozir yuborish
                    </Button>
                }
            />

            <div className="space-y-6">
                {error && (
                    <div className="rounded-2xl border border-error-200 bg-error-50 p-4 text-sm text-error-700 dark:border-error-500/20 dark:bg-error-500/10 dark:text-error-300">
                        Ko'rsatkichlarni yuklashda xatolik yuz berdi: {(error as Error).message}
                    </div>
                )}

                {data && (
                    <>
                        {/* 1. ESDA QOLARLI ASOSIY MAYOQ: Maqsadga yo'l (Paying Families & Revenue) */}
                        <div className="grid gap-5 md:grid-cols-2">
                            <GoalHeroCard
                                title="To'lov qilgan oilalar"
                                value={data.totals.payingFamilies}
                                min={data.minFamilies}
                                goal={data.goalFamilies}
                                format={(n) => `${n.toLocaleString("ru-RU")}`}
                                sublabel="Asosiy paket: 3 oylik (300K)"
                                unit="oila"
                            />
                            <GoalHeroCard
                                title="Jami tushum"
                                value={data.totals.revenueSom}
                                min={data.minRevenueSom}
                                goal={data.goalRevenueSom}
                                format={formatSom}
                                sublabel="Pul oqimi birinchi"
                                unit="so'm"
                            />
                        </div>

                        {/* 2. Bosqichma-bosqich konversiya voronkasi (Visual Stepped Pipeline) */}
                        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs dark:border-gray-800 dark:bg-white/[0.02]">
                            <div className="border-b border-gray-100 pb-3 dark:border-gray-800">
                                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                                    5 bosqichli konversiya zanjiri (Reja boshidan)
                                </h3>
                                <p className="mt-0.5 text-xs text-gray-500">
                                    Foydalanuvchilar qaysi qadamda yo'qolyapti — keyingi haftaning eng asosiy diqqat markazi.
                                </p>
                            </div>

                            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
                                <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-4 dark:border-gray-800 dark:bg-gray-900">
                                    <span className="text-[11px] font-semibold text-gray-500">1. Ro'yxatdan o'tish</span>
                                    <div className="mt-1 text-2xl font-black text-gray-900 dark:text-white">
                                        {data.totals.registrations.toLocaleString("ru-RU")}
                                    </div>
                                    <div className="mt-1 text-[11px] font-medium text-gray-400">100% kiruvchi</div>
                                </div>

                                <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-4 dark:border-gray-800 dark:bg-gray-900">
                                    <span className="text-[11px] font-semibold text-gray-500">2. Diagnostika</span>
                                    <div className="mt-1 text-2xl font-black text-gray-900 dark:text-white">
                                        {data.totals.diagnostics.toLocaleString("ru-RU")}
                                    </div>
                                    <div className="mt-1 text-[11px] font-bold text-brand-600">
                                        {percent(data.totals.diagnostics, data.totals.registrations)} konversiya
                                    </div>
                                </div>

                                <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-4 dark:border-gray-800 dark:bg-gray-900">
                                    <span className="text-[11px] font-semibold text-gray-500">3. 7-kun qaytish</span>
                                    <div className="mt-1 text-2xl font-black text-gray-900 dark:text-white">
                                        {data.totals.returned7d.toLocaleString("ru-RU")}
                                    </div>
                                    <div className="mt-1 text-[11px] font-bold text-brand-600">
                                        {percent(data.totals.returned7d, data.totals.registrations)} saqlanish
                                    </div>
                                </div>

                                <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-4 dark:border-gray-800 dark:bg-gray-900">
                                    <span className="text-[11px] font-semibold text-gray-500">4. Sinov (7 kun)</span>
                                    <div className="mt-1 text-2xl font-black text-gray-900 dark:text-white">
                                        {data.totals.trials.toLocaleString("ru-RU")}
                                    </div>
                                    <div className="mt-1 text-[11px] font-bold text-brand-600">
                                        {percent(data.totals.trials, data.totals.registrations)} sinovda
                                    </div>
                                </div>

                                <div className="col-span-2 sm:col-span-1 rounded-xl border border-success-200 bg-success-50/50 p-4 dark:border-success-500/20 dark:bg-success-500/10">
                                    <span className="text-[11px] font-bold text-success-800 dark:text-success-300">
                                        5. To'lov qilgan
                                    </span>
                                    <div className="mt-1 text-2xl font-black text-success-700 dark:text-success-400">
                                        {data.totals.payingFamilies.toLocaleString("ru-RU")}
                                    </div>
                                    <div className="mt-1 text-[11px] font-extrabold text-success-700 dark:text-success-300">
                                        {percent(data.totals.payingFamilies, data.totals.registrations)} to'lovga o'tdi
                                    </div>
                                </div>
                            </div>

                            <div className="mt-5">
                                <CommonTable
                                    data={[{...data.totals, label: "Jami yakuniy ko'rsatkich"}]}
                                    columns={funnelColumns}
                                />
                            </div>
                        </div>

                        {/* 3. Haftalar dinamikasi & Sokin Trend Grafigi */}
                        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs dark:border-gray-800 dark:bg-white/[0.02]">
                            <div className="border-b border-gray-100 pb-3 dark:border-gray-800">
                                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                                    Haftalik o'sish dinamikasi
                                </h3>
                                <p className="mt-0.5 text-xs text-gray-500">
                                    Haftalar bo'yicha kiruvchi oqim va to'lovchilar sur'ati.
                                </p>
                            </div>

                            {data.weeks.length > 0 && (
                                <div className="mt-4 rounded-xl border border-gray-100 bg-white p-3 dark:border-gray-800 dark:bg-gray-900/60">
                                    <Chart
                                        options={chartOptions}
                                        series={chartSeries}
                                        type="area"
                                        height={240}
                                    />
                                </div>
                            )}

                            <div className="mt-4">
                                <CommonTable data={weekRows} columns={funnelColumns} isPending={isPending}/>
                            </div>
                        </div>

                        {/* 4. Ikki segment sinovi (5–8-sinf vs 9–11-sinf / DTM) */}
                        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs dark:border-gray-800 dark:bg-white/[0.02]">
                            <div className="border-b border-gray-100 pb-3 dark:border-gray-800">
                                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                                    Ikki segment sinovi (A/B Test)
                                </h3>
                                <p className="mt-0.5 text-xs text-gray-500">
                                    26-oktabrda g'olib aniqlanadi: diagnostika va sinovga arzonroq hamda ko'proq to'lovchi olib kelgan segment kuchaytiriladi.
                                </p>
                            </div>

                            {segmentComparison && (
                                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                                    <div
                                        className={`rounded-2xl border p-5 transition ${
                                            segmentComparison.leader === "GRADES_5_8"
                                                ? "border-brand-500 bg-brand-50/50 dark:border-brand-500/40 dark:bg-brand-500/10 shadow-xs"
                                                : "border-gray-200 bg-gray-50/40 dark:border-gray-800 dark:bg-gray-900"
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-bold text-gray-900 dark:text-white">
                                                5–8-sinf (Bo'shliqlarni to'ldirish)
                                            </span>
                                            {segmentComparison.leader === "GRADES_5_8" && (
                                                <span className="rounded-full bg-brand-500 px-2.5 py-0.5 text-[11px] font-bold text-white shadow-xs">
                                                    👑 Yetakchi segment
                                                </span>
                                            )}
                                        </div>
                                        <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                                            <div className="rounded-lg bg-white p-2.5 shadow-xs dark:bg-gray-800">
                                                <span className="text-gray-400">To'lov</span>
                                                <div className="mt-0.5 text-base font-bold text-gray-900 dark:text-white">
                                                    {segmentComparison.seg58.payingFamilies} ta
                                                </div>
                                            </div>
                                            <div className="rounded-lg bg-white p-2.5 shadow-xs dark:bg-gray-800">
                                                <span className="text-gray-400">Konversiya</span>
                                                <div className="mt-0.5 text-base font-bold text-brand-600">
                                                    {segmentComparison.rate58.toFixed(1)}%
                                                </div>
                                            </div>
                                            <div className="rounded-lg bg-white p-2.5 shadow-xs dark:bg-gray-800">
                                                <span className="text-gray-400">Tushum</span>
                                                <div className="mt-0.5 text-xs font-bold text-gray-900 dark:text-white">
                                                    {formatSom(segmentComparison.seg58.revenueSom)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div
                                        className={`rounded-2xl border p-5 transition ${
                                            segmentComparison.leader === "GRADES_9_11"
                                                ? "border-brand-500 bg-brand-50/50 dark:border-brand-500/40 dark:bg-brand-500/10 shadow-xs"
                                                : "border-gray-200 bg-gray-50/40 dark:border-gray-800 dark:bg-gray-900"
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-bold text-gray-900 dark:text-white">
                                                9–11-sinf / DTM (Sertifikat)
                                            </span>
                                            {segmentComparison.leader === "GRADES_9_11" && (
                                                <span className="rounded-full bg-brand-500 px-2.5 py-0.5 text-[11px] font-bold text-white shadow-xs">
                                                    👑 Yetakchi segment
                                                </span>
                                            )}
                                        </div>
                                        <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                                            <div className="rounded-lg bg-white p-2.5 shadow-xs dark:bg-gray-800">
                                                <span className="text-gray-400">To'lov</span>
                                                <div className="mt-0.5 text-base font-bold text-gray-900 dark:text-white">
                                                    {segmentComparison.seg911.payingFamilies} ta
                                                </div>
                                            </div>
                                            <div className="rounded-lg bg-white p-2.5 shadow-xs dark:bg-gray-800">
                                                <span className="text-gray-400">Konversiya</span>
                                                <div className="mt-0.5 text-base font-bold text-brand-600">
                                                    {segmentComparison.rate911.toFixed(1)}%
                                                </div>
                                            </div>
                                            <div className="rounded-lg bg-white p-2.5 shadow-xs dark:bg-gray-800">
                                                <span className="text-gray-400">Tushum</span>
                                                <div className="mt-0.5 text-xs font-bold text-gray-900 dark:text-white">
                                                    {formatSom(segmentComparison.seg911.revenueSom)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="mt-4">
                                <CommonTable data={segmentRows} columns={funnelColumns}/>
                            </div>
                        </div>

                        {/* 5. Manbalar jadvali (UTM / Promo-kod) */}
                        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs dark:border-gray-800 dark:bg-white/[0.02]">
                            <div className="border-b border-gray-100 pb-3 dark:border-gray-800">
                                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                                    Manbalar (Reklama kanali va Promo-kodlar)
                                </h3>
                                <p className="mt-0.5 text-xs text-gray-500">
                                    Bitta to'lovchi oila ≤ 150 000 so'mga tushgan kanalga byudjet oshiriladi.
                                </p>
                            </div>

                            <div className="mt-4">
                                <CommonTable data={data.bySource} columns={sourceColumns}/>
                                {data.bySource.length === 0 && (
                                    <div className="p-8 text-center text-xs text-gray-500">
                                        Hozircha promo-kod yoki UTM manbalari bo'yicha ma'lumot tushmagan.
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}

                {isPending && (
                    <div className="p-16 text-center text-sm text-gray-500 dark:text-gray-400">
                        Ko'rsatkichlar yuklanmoqda…
                    </div>
                )}
            </div>
        </div>
    );
}
