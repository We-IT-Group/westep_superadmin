import {useMemo, useState} from "react";
import {ColumnDef} from "@tanstack/react-table";
import Chart from "react-apexcharts";
import {ApexOptions} from "apexcharts";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import ComponentCard from "../../components/common/ComponentCard";
import CommonTable from "../../components/tables/CommonTable/CommonTable.tsx";
import Button from "../../components/ui/button/Button.tsx";
import StatusToast from "../../components/paymentSettings/StatusToast.tsx";
import {GrowthFunnelDto, GrowthSourceStatDto} from "../../api/growth/growthApi.ts";
import {useGrowthSummary, useSendGrowthBrief} from "../../api/growth/useGrowth.ts";
import {formatSom, LEARNER_SEGMENT_LABELS, percent} from "./labels.ts";

type FunnelRow = GrowthFunnelDto & { label: string };

const sourceColumns: ColumnDef<GrowthSourceStatDto>[] = [
    {
        accessorKey: "source",
        header: "Manba / Promo-kod",
        cell: ({row}) => (
            <span className="font-medium text-gray-900 dark:text-white/90">
                {row.original.source || "Noma'lum manba"}
            </span>
        ),
    },
    {
        accessorKey: "registrations",
        header: "Ro'yxatdan o'tgan",
        cell: ({row}) => row.original.registrations.toLocaleString("ru-RU"),
    },
    {
        accessorKey: "payingFamilies",
        header: "To'lovchi oilalar",
        cell: ({row}) => {
            const pct = percent(row.original.payingFamilies, row.original.registrations);
            return (
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-success-700 dark:text-success-400">
                        {row.original.payingFamilies}
                    </span>
                    <span className="text-xs text-gray-400 font-medium">({pct})</span>
                </div>
            );
        },
    },
    {
        accessorKey: "revenueSom",
        header: "Tushum",
        cell: ({row}) => (
            <span className="font-semibold text-gray-900 dark:text-white">
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
}

/**
 * ESDA QOLARLI ELEMENT: "Maqsadga yo'l" kartasi
 * CEO ertalab 10 soniyada minimum va maqsadga yetish darajasini ko'radi.
 */
function GoalCard({title, value, min, goal, format, sublabel}: GoalCardProps) {
    const width = goal > 0 ? Math.min(100, Math.round((value / goal) * 100)) : 0;
    const minMark = goal > 0 ? Math.min(100, Math.round((min / goal) * 100)) : 0;
    const reachedMin = value >= min;
    const reachedGoal = value >= goal;

    return (
        <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-xs dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</span>
                <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        reachedGoal
                            ? "bg-success-100 text-success-800 dark:bg-success-500/20 dark:text-success-300"
                            : reachedMin
                            ? "bg-brand-50 text-brand-700 dark:bg-brand-500/20 dark:text-brand-300"
                            : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                    }`}
                >
                    {reachedGoal ? "Maqsad bajarildi!" : reachedMin ? "Minimum marraga yetildi" : `${width}% bajarildi`}
                </span>
            </div>

            <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                    {format(value)}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">/ maqsad {format(goal)}</span>
            </div>

            {/* Progress chizig'i + Minimum chegarasi */}
            <div className="relative mt-4 h-3 w-full rounded-full bg-gray-100 dark:bg-gray-800">
                <div
                    className={`h-full rounded-full transition-all duration-500 ${
                        reachedMin ? "bg-success-500" : "bg-brand-500"
                    }`}
                    style={{width: `${Math.max(2, width)}%`}}
                />
                {/* Minimum marra chizig'i (sariq marker) */}
                <div
                    className="absolute top-[-4px] bottom-[-4px] w-[3px] rounded-full bg-warning-500 ring-2 ring-white dark:ring-gray-900"
                    style={{left: `${minMark}%`}}
                    title={`Minimum chegara: ${format(min)}`}
                />
            </div>

            <div className="mt-2.5 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1 font-medium">
                    <span className="inline-block size-2 rounded-full bg-warning-500" />
                    Minimum: {format(min)}
                </span>
                <span>{sublabel}</span>
                <span className="font-semibold text-gray-700 dark:text-gray-300">Maqsad: {format(goal)}</span>
            </div>
        </div>
    );
}

const funnelColumns: ColumnDef<FunnelRow>[] = [
    {
        accessorKey: "label",
        header: "Davr / Segment",
        cell: ({row}) => (
            <span className="font-semibold text-gray-900 dark:text-white/90">
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
                <span>{row.original.diagnostics}</span>
                <span className="ml-1.5 text-xs text-gray-400 font-medium">
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
                <span>{row.original.returned7d}</span>
                <span className="ml-1.5 text-xs text-gray-400 font-medium">
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
                <span className="text-xs text-gray-400 font-medium">
                    ({percent(row.original.payingFamilies, row.original.registrations)})
                </span>
            </div>
        ),
    },
    {
        accessorKey: "revenueSom",
        header: "Tushum",
        cell: ({row}) => (
            <span className="font-semibold text-gray-900 dark:text-white">
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
                message: "Ertalabki xulosa hisoboti Telegram admin kanaliga yuborildi",
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

    // Segmentlar bo'yicha g'olibni aniqlash
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

    // Haftalik ApexCharts dinamikasi
    const chartOptions: ApexOptions = useMemo(() => {
        const categories = (data?.weeks ?? []).map((_, i) => `${i + 1}-hafta`);
        return {
            chart: {
                type: "area",
                height: 260,
                toolbar: {show: false},
                fontFamily: "inherit",
            },
            colors: ["#465fff", "#10b981"],
            dataLabels: {enabled: false},
            stroke: {curve: "smooth", width: 2},
            xaxis: {
                categories: categories.length > 0 ? categories : ["1-hafta", "2-hafta", "3-hafta", "4-hafta"],
                labels: {style: {fontSize: "12px"}},
            },
            yaxis: {
                labels: {style: {fontSize: "12px"}},
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
        <>
            {toast && <StatusToast message={toast.message} type={toast.type} onClose={() => setToast(null)}/>}
            <PageMeta title="Ko'rsatkichlar — Boshqaruv markazi" description="Funnel va 8 haftalik maqsadlar"/>
            <PageBreadcrumb pageTitle="Ko'rsatkichlar — Funnel va Maqsadlar"/>

            <div className="space-y-6">
                {error && (
                    <div className="rounded-xl border border-error-200 bg-error-50 p-4 text-sm text-error-700 dark:border-error-500/20 dark:bg-error-500/10 dark:text-error-300">
                        Ko'rsatkichlarni yuklashda xatolik: {(error as Error).message}
                    </div>
                )}

                {data && (
                    <>
                        {/* 1. Yuqori holat satri va Hisobot yuborish */}
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-xs dark:border-gray-800 dark:bg-gray-900">
                            <div>
                                <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                                    8 haftalik sotuv ritmi
                                </h2>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                    Reja boshlangan sana: <span className="font-medium text-gray-700 dark:text-gray-300">{data.planStart}</span> · 
                                    Joriy davr: <span className="font-medium text-brand-600 dark:text-brand-400">
                                        {data.currentWeek < 1
                                            ? "hali boshlanmagan"
                                            : data.currentWeek > 8
                                            ? "reja yakunlangan"
                                            : `${data.currentWeek}-hafta`}
                                    </span>
                                </p>
                            </div>

                            <Button
                                size="sm"
                                variant="outline"
                                onClick={handleSendBrief}
                                isPending={sendBrief.isPending}
                                className="min-h-[44px]"
                            >
                                Ertalabki hisobotni hozir yuborish
                            </Button>
                        </div>

                        {/* 2. ESDA QOLARLI ELEMENT: Maqsadga yo'l (Paying Families & Revenue) */}
                        <div className="grid gap-4 md:grid-cols-2">
                            <GoalCard
                                title="To'lov qilgan oilalar"
                                value={data.totals.payingFamilies}
                                min={data.minFamilies}
                                goal={data.goalFamilies}
                                format={(n) => `${n.toLocaleString("ru-RU")} ta oila`}
                                sublabel="3 oylik asosiy dastur (300 000 so'm)"
                            />
                            <GoalCard
                                title="Jami tushum"
                                value={data.totals.revenueSom}
                                min={data.minRevenueSom}
                                goal={data.goalRevenueSom}
                                format={formatSom}
                                sublabel="Pul oqimi birinchi"
                            />
                        </div>

                        {/* 3. Bosqichma-bosqich konversiya voronkasi (Visual Stepped Funnel) */}
                        <ComponentCard
                            title="Konversiya voronkasi (Reja boshidan jami)"
                            desc="Har bir qadamdagi odam yo'qotilishi — keyingi haftaning asosiy fokus nuqtasi."
                        >
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                                <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-gray-800/40">
                                    <div className="text-xs font-medium text-gray-500">1. Ro'yxatdan o'tish</div>
                                    <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                                        {data.totals.registrations.toLocaleString("ru-RU")}
                                    </div>
                                    <div className="mt-1 text-[11px] text-gray-400">Bazaviy 100%</div>
                                </div>

                                <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-gray-800/40">
                                    <div className="text-xs font-medium text-gray-500">2. Diagnostika</div>
                                    <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                                        {data.totals.diagnostics.toLocaleString("ru-RU")}
                                    </div>
                                    <div className="mt-1 text-xs font-semibold text-brand-600">
                                        {percent(data.totals.diagnostics, data.totals.registrations)} konversiya
                                    </div>
                                </div>

                                <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-gray-800/40">
                                    <div className="text-xs font-medium text-gray-500">3. 7-kun qaytish</div>
                                    <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                                        {data.totals.returned7d.toLocaleString("ru-RU")}
                                    </div>
                                    <div className="mt-1 text-xs font-semibold text-brand-600">
                                        {percent(data.totals.returned7d, data.totals.registrations)} ushlab qolish
                                    </div>
                                </div>

                                <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-gray-800/40">
                                    <div className="text-xs font-medium text-gray-500">4. Sinov (7 kun)</div>
                                    <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                                        {data.totals.trials.toLocaleString("ru-RU")}
                                    </div>
                                    <div className="mt-1 text-xs font-semibold text-brand-600">
                                        {percent(data.totals.trials, data.totals.registrations)} sinovda
                                    </div>
                                </div>

                                <div className="rounded-xl border border-success-200 bg-success-50/40 p-4 dark:border-success-500/20 dark:bg-success-500/5 col-span-2 sm:col-span-1">
                                    <div className="text-xs font-medium text-success-800 dark:text-success-300">
                                        5. To'lov qilgan
                                    </div>
                                    <div className="mt-1 text-2xl font-bold text-success-700 dark:text-success-400">
                                        {data.totals.payingFamilies.toLocaleString("ru-RU")}
                                    </div>
                                    <div className="mt-1 text-xs font-bold text-success-700 dark:text-success-400">
                                        {percent(data.totals.payingFamilies, data.totals.registrations)} umumiy
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4">
                                <CommonTable
                                    data={[{...data.totals, label: "Jami yakuniy ko'rsatkich"}]}
                                    columns={funnelColumns}
                                />
                            </div>
                        </ComponentCard>

                        {/* 4. Haftalar dinamikasi & Bitta sokin grafik */}
                        <ComponentCard
                            title="Haftalik dinamika"
                            desc="Haftalar kesimidagi o'sish sur'ati va har bir haftaning to'lov konversiyasi."
                        >
                            {data.weeks.length > 0 && (
                                <div className="mb-4 rounded-xl border border-gray-100 bg-white p-3 dark:border-gray-800 dark:bg-gray-900">
                                    <Chart
                                        options={chartOptions}
                                        series={chartSeries}
                                        type="area"
                                        height={240}
                                    />
                                </div>
                            )}
                            <CommonTable data={weekRows} columns={funnelColumns} isPending={isPending}/>
                        </ComponentCard>

                        {/* 5. Ikki segment sinovi (5–8-sinf vs 9–11-sinf) */}
                        <ComponentCard
                            title="Segmentlar sinovi (5–8-sinf vs 9–11-sinf / DTM)"
                            desc="26-oktabrda g'olib aniqlanadi: diagnostika va sinovga arzonroq hamda ko'proq to'lovchi olib kelgan segment kuchaytiriladi."
                        >
                            {segmentComparison && (
                                <div className="mb-4 grid gap-3 sm:grid-cols-2">
                                    <div
                                        className={`rounded-xl border p-4 transition ${
                                            segmentComparison.leader === "GRADES_5_8"
                                                ? "border-brand-500 bg-brand-50/50 dark:border-brand-500/40 dark:bg-brand-500/10"
                                                : "border-gray-200 bg-gray-50/40 dark:border-gray-800 dark:bg-gray-900"
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                                5–8-sinf (Bo'shliqlarni to'ldirish)
                                            </span>
                                            {segmentComparison.leader === "GRADES_5_8" && (
                                                <span className="rounded bg-brand-500 px-2 py-0.5 text-[11px] font-semibold text-white">
                                                    Hozirgi yetakchi
                                                </span>
                                            )}
                                        </div>
                                        <div className="mt-2 text-xs text-gray-600 dark:text-gray-300">
                                            To'lov: <span className="font-bold">{segmentComparison.seg58.payingFamilies} ta</span> · 
                                            Konversiya: <span className="font-bold">{segmentComparison.rate58.toFixed(1)}%</span> · 
                                            Tushum: <span className="font-bold">{formatSom(segmentComparison.seg58.revenueSom)}</span>
                                        </div>
                                    </div>

                                    <div
                                        className={`rounded-xl border p-4 transition ${
                                            segmentComparison.leader === "GRADES_9_11"
                                                ? "border-brand-500 bg-brand-50/50 dark:border-brand-500/40 dark:bg-brand-500/10"
                                                : "border-gray-200 bg-gray-50/40 dark:border-gray-800 dark:bg-gray-900"
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                                9–11-sinf / DTM (Milliy sertifikat)
                                            </span>
                                            {segmentComparison.leader === "GRADES_9_11" && (
                                                <span className="rounded bg-brand-500 px-2 py-0.5 text-[11px] font-semibold text-white">
                                                    Hozirgi yetakchi
                                                </span>
                                            )}
                                        </div>
                                        <div className="mt-2 text-xs text-gray-600 dark:text-gray-300">
                                            To'lov: <span className="font-bold">{segmentComparison.seg911.payingFamilies} ta</span> · 
                                            Konversiya: <span className="font-bold">{segmentComparison.rate911.toFixed(1)}%</span> · 
                                            Tushum: <span className="font-bold">{formatSom(segmentComparison.seg911.revenueSom)}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <CommonTable data={segmentRows} columns={funnelColumns}/>
                        </ComponentCard>

                        {/* 6. Manbalar (UTM / Promo-kod) */}
                        <ComponentCard
                            title="Manbalar (Reklama kanali / Promo-kod)"
                            desc="Bitta to'lovchi oila ≤ 150 000 so'mga tushgan kanalga byudjet oshiriladi. Manbani o'quvchi ilovasi /api/me/acquisition orqali yozadi."
                        >
                            <CommonTable data={data.bySource} columns={sourceColumns}/>
                            {data.bySource.length === 0 && (
                                <div className="p-6 text-center text-xs text-gray-500">
                                    Hozircha promo-kod yoki UTM manbalari bo'yicha ma'lumot tushmagan.
                                </div>
                            )}
                        </ComponentCard>
                    </>
                )}

                {isPending && (
                    <div className="p-12 text-center text-sm text-gray-500 dark:text-gray-400">
                        Ko'rsatkichlar yuklanmoqda…
                    </div>
                )}
            </div>
        </>
    );
}
