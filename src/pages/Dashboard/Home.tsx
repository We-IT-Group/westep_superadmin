import {Link} from "react-router";
import PageMeta from "../../components/common/PageMeta";
import westepLogo from "../../assets/westep-logo.png";
import westepDarkLogo from "../../assets/westep-logo-dark.png";
import {useGrowthSummary} from "../../api/growth/useGrowth";
import {useGiftOrders} from "../../api/gifts/useGifts";
import {useGetBusinesses} from "../../api/business/useBusiness";
import {useGetCourseModerationList} from "../../api/courseModeration/useCourseModeration";
import {
    ArrowRightIcon,
    BoxCubeIcon,
    FolderIcon,
    PaperPlaneIcon,
    ShootingStarIcon,
    TaskIcon,
    UserCircleIcon,
    VideoIcon,
} from "../../icons";

export default function Home() {
    // Growth metrics (with safe defaults)
    const {data: growth} = useGrowthSummary();
    const {data: newOrders} = useGiftOrders("NEW", 0, 10);
    const {data: businesses} = useGetBusinesses();
    const {data: pendingCourses} = useGetCourseModerationList({status: "PENDING", page: 0, size: 10});

    const currentFamilies = growth?.totals?.payingFamilies ?? 0;
    const targetFamilies = growth?.goalFamilies ?? 100;
    const minFamilies = growth?.minFamilies ?? 30;
    const familiesPct = Math.min(100, Math.round((currentFamilies / targetFamilies) * 100));

    const currentRevenue = growth?.totals?.revenueSom ?? 0;
    const targetRevenue = growth?.goalRevenueSom ?? 30_000_000;
    const minRevenue = growth?.minRevenueSom ?? 9_000_000;
    const revenuePct = Math.min(100, Math.round((currentRevenue / targetRevenue) * 100));

    const newOrdersCount = newOrders?.totalElements ?? 0;
    const businessesCount = Array.isArray(businesses) ? businesses.length : 0;
    const pendingCoursesCount = pendingCourses?.totalItems ?? 0;

    return (
        <>
            <PageMeta
                title="Boshqaruv paneli | Westep Superadmin"
                description="Westep superadmin boshqaruv paneli va asosiy operatsion ko'rsatkichlar"
            />

            <div className="space-y-6">
                {/* 1. Header Banner */}
                <div className="relative overflow-hidden rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
                    <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                        <div className="space-y-1.5">
                            <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
                                <span className="h-1.5 w-1.5 rounded-full bg-brand-500 animate-pulse" />
                                Superadmin Boshqaruv Markazi
                            </div>
                            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
                                Xush kelibsiz, Asoschi! 👋
                            </h1>
                            <p className="max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                                8 haftalik sotuv rejasi ijrosi, kunlik tarbiya odatlari va platforma operatsiyalarining yagona markazi.
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <img
                                src={westepDarkLogo}
                                alt="Westep Logo"
                                className="h-12 w-auto object-contain dark:hidden"
                            />
                            <img
                                src={westepLogo}
                                alt="Westep Logo"
                                className="hidden h-12 w-auto object-contain dark:block"
                            />
                        </div>
                    </div>
                </div>

                {/* 2. Executive Growth Strip (The Core "Path to Goal") */}
                <div className="rounded-2xl border border-brand-200/80 bg-gradient-to-br from-brand-50/50 via-white to-brand-50/20 p-6 shadow-sm dark:border-brand-500/20 dark:from-brand-950/20 dark:via-gray-900/40 dark:to-gray-900">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-brand-100/70 pb-4 dark:border-brand-500/10">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-500 text-white shadow-sm">
                                    <TaskIcon className="h-4 w-4" />
                                </span>
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    8 haftalik sotuv rejasi — Joriy holat
                                </h2>
                            </div>
                            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                                6-oktyabr — 29-noyabr 2026 oralig'idagi asosiy o'sish vazifalari va maqsadlar
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Link
                                to="/growth/metrics"
                                className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
                            >
                                Ko'rsatkichlar tahlili
                                <ArrowRightIcon className="h-3.5 w-3.5" />
                            </Link>
                            <Link
                                to="/growth/plan"
                                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                            >
                                Rejani ko'rish
                            </Link>
                        </div>
                    </div>

                    <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                        {/* Target 1: Families */}
                        <div className="rounded-xl border border-gray-200/80 bg-white/80 p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900/60 backdrop-blur-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                    To'lovchi oilalar
                                </span>
                                <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
                                    {familiesPct}%
                                </span>
                            </div>
                            <div className="mt-3 flex items-baseline gap-2">
                                <span className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                                    {currentFamilies}
                                </span>
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                    / {targetFamilies} ta oila
                                </span>
                            </div>

                            {/* Progress bar with min marker */}
                            <div className="relative mt-4">
                                <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                                    <div
                                        className="h-full rounded-full bg-brand-500 transition-all duration-500"
                                        style={{width: `${familiesPct}%`}}
                                    />
                                </div>
                                <div
                                    className="absolute -top-1 bottom-0 w-0.5 bg-warning-500"
                                    style={{left: `${(minFamilies / targetFamilies) * 100}%`}}
                                    title={`Tirik qolish minimumi: ${minFamilies}`}
                                />
                            </div>
                            <div className="mt-2 flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
                                <span>Boshlanish: 0</span>
                                <span className="font-medium text-warning-600 dark:text-warning-400">Min: {minFamilies} ta</span>
                                <span>Maqsad: {targetFamilies} ta</span>
                            </div>
                        </div>

                        {/* Target 2: Revenue */}
                        <div className="rounded-xl border border-gray-200/80 bg-white/80 p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900/60 backdrop-blur-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                    Umumiy tushum
                                </span>
                                <span className="rounded-full bg-success-50 px-2.5 py-0.5 text-xs font-semibold text-success-600 dark:bg-success-500/10 dark:text-success-300">
                                    {revenuePct}%
                                </span>
                            </div>
                            <div className="mt-3 flex items-baseline gap-2">
                                <span className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                                    {(currentRevenue / 1_000_000).toLocaleString("uz-UZ", {maximumFractionDigits: 1})} mln
                                </span>
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                    / {(targetRevenue / 1_000_000).toFixed(0)} mln so'm
                                </span>
                            </div>

                            {/* Progress bar with min marker */}
                            <div className="relative mt-4">
                                <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                                    <div
                                        className="h-full rounded-full bg-success-500 transition-all duration-500"
                                        style={{width: `${revenuePct}%`}}
                                    />
                                </div>
                                <div
                                    className="absolute -top-1 bottom-0 w-0.5 bg-warning-500"
                                    style={{left: `${(minRevenue / targetRevenue) * 100}%`}}
                                    title={`Tirik qolish minimumi: ${(minRevenue / 1_000_000).toFixed(0)} mln so'm`}
                                />
                            </div>
                            <div className="mt-2 flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
                                <span>0</span>
                                <span className="font-medium text-warning-600 dark:text-warning-400">Min: {(minRevenue / 1_000_000).toFixed(0)}M</span>
                                <span>Maqsad: {(targetRevenue / 1_000_000).toFixed(0)}M so'm</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Operational Pulse (Real Key Indicators) */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Item 1: Sovg'a buyurtmalari navbati */}
                    <Link
                        to="/gift-orders"
                        className="group rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm transition-all hover:border-brand-300 hover:shadow-md dark:border-gray-800 dark:bg-white/[0.03] dark:hover:border-brand-500/40"
                    >
                        <div className="flex items-center justify-between">
                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-300 group-hover:scale-105 transition-transform">
                                <BoxCubeIcon className="h-5 w-5" />
                            </span>
                            {newOrdersCount > 0 && (
                                <span className="inline-flex items-center rounded-full bg-error-50 px-2 py-0.5 text-xs font-semibold text-error-600 dark:bg-error-500/10 dark:text-error-300 animate-pulse">
                                    {newOrdersCount} kutilmoqda
                                </span>
                            )}
                        </div>
                        <h3 className="mt-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                            Sovg'a buyurtmalari
                        </h3>
                        <p className="mt-1 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                            {newOrdersCount} ta yangi
                        </p>
                        <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-brand-600 group-hover:text-brand-700 dark:text-brand-400">
                            Buyurtmalarni ko'rish &rarr;
                        </span>
                    </Link>

                    {/* Item 2: Kurs moderatsiyasi */}
                    <Link
                        to="/course-moderation"
                        className="group rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm transition-all hover:border-brand-300 hover:shadow-md dark:border-gray-800 dark:bg-white/[0.03] dark:hover:border-brand-500/40"
                    >
                        <div className="flex items-center justify-between">
                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300 group-hover:scale-105 transition-transform">
                                <VideoIcon className="h-5 w-5" />
                            </span>
                            {pendingCoursesCount > 0 && (
                                <span className="inline-flex items-center rounded-full bg-warning-50 px-2 py-0.5 text-xs font-semibold text-warning-700 dark:bg-warning-500/10 dark:text-warning-300">
                                    Tekshiruvda
                                </span>
                            )}
                        </div>
                        <h3 className="mt-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                            Kurs moderatsiyasi
                        </h3>
                        <p className="mt-1 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                            {pendingCoursesCount} ta kurs
                        </p>
                        <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-brand-600 group-hover:text-brand-700 dark:text-brand-400">
                            Moderatsiya qilish &rarr;
                        </span>
                    </Link>

                    {/* Item 3: Kunlik odatlar (tarbiya) */}
                    <Link
                        to="/habits"
                        className="group rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm transition-all hover:border-brand-300 hover:shadow-md dark:border-gray-800 dark:bg-white/[0.03] dark:hover:border-brand-500/40"
                    >
                        <div className="flex items-center justify-between">
                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300 group-hover:scale-105 transition-transform">
                                <ShootingStarIcon className="h-5 w-5" />
                            </span>
                            <span className="inline-flex items-center rounded-full bg-success-50 px-2 py-0.5 text-xs font-semibold text-success-600 dark:bg-success-500/10 dark:text-success-300">
                                Faol
                            </span>
                        </div>
                        <h3 className="mt-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                            Kunlik odatlar (tarbiya)
                        </h3>
                        <p className="mt-1 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                            Rotatsiya va mukofot
                        </p>
                        <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-brand-600 group-hover:text-brand-700 dark:text-brand-400">
                            Odatlarni boshqarish &rarr;
                        </span>
                    </Link>

                    {/* Item 4: Hamkor Bizneslar */}
                    <Link
                        to="/businesses"
                        className="group rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm transition-all hover:border-brand-300 hover:shadow-md dark:border-gray-800 dark:bg-white/[0.03] dark:hover:border-brand-500/40"
                    >
                        <div className="flex items-center justify-between">
                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300 group-hover:scale-105 transition-transform">
                                <FolderIcon className="h-5 w-5" />
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">B2B</span>
                        </div>
                        <h3 className="mt-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                            Hamkor bizneslar
                        </h3>
                        <p className="mt-1 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                            {businessesCount} ta markaz
                        </p>
                        <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-brand-600 group-hover:text-brand-700 dark:text-brand-400">
                            Bizneslar ro'yxati &rarr;
                        </span>
                    </Link>
                </div>

                {/* 4. Quick Actions Hub */}
                <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
                    <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                        Tezkor amallar (Quick Actions)
                    </h2>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Har kuni eng ko'p ishlatiladigan asosiy operatsiyalarga 1-klikda o'tish
                    </p>

                    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <Link
                            to="/habits"
                            className="flex items-center gap-3 rounded-xl border border-gray-200/70 p-3.5 text-sm font-medium text-gray-800 transition-colors hover:border-brand-500 hover:bg-brand-50/30 dark:border-gray-800 dark:text-gray-200 dark:hover:bg-brand-500/10"
                        >
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
                                <ShootingStarIcon className="h-4 w-4" />
                            </span>
                            Yangi odat qo'shish
                        </Link>

                        <Link
                            to="/growth/marketing"
                            className="flex items-center gap-3 rounded-xl border border-gray-200/70 p-3.5 text-sm font-medium text-gray-800 transition-colors hover:border-brand-500 hover:bg-brand-50/30 dark:border-gray-800 dark:text-gray-200 dark:hover:bg-brand-500/10"
                        >
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
                                <TaskIcon className="h-4 w-4" />
                            </span>
                            Marketing post tasdiqlash
                        </Link>

                        <Link
                            to="/gifts"
                            className="flex items-center gap-3 rounded-xl border border-gray-200/70 p-3.5 text-sm font-medium text-gray-800 transition-colors hover:border-brand-500 hover:bg-brand-50/30 dark:border-gray-800 dark:text-gray-200 dark:hover:bg-brand-500/10"
                        >
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-300">
                                <BoxCubeIcon className="h-4 w-4" />
                            </span>
                            Sovg'a katalogi
                        </Link>

                        <Link
                            to="/admin-notifications"
                            className="flex items-center gap-3 rounded-xl border border-gray-200/70 p-3.5 text-sm font-medium text-gray-800 transition-colors hover:border-brand-500 hover:bg-brand-50/30 dark:border-gray-800 dark:text-gray-200 dark:hover:bg-brand-500/10"
                        >
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300">
                                <PaperPlaneIcon className="h-4 w-4" />
                            </span>
                            Bildirishnoma yuborish
                        </Link>
                    </div>
                </div>

                {/* 5. System Domain Hub */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
                        <div className="flex items-center gap-2">
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
                                <ShootingStarIcon className="h-4 w-4" />
                            </span>
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                                Ta'lim & Tarbiya
                            </h3>
                        </div>
                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                            Bolalar uchun odatlar rotatsiyasi, coin mukofotlari, sovg'alar va o'quv dasturlari.
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                            <Link to="/habits" className="text-xs text-brand-600 hover:underline dark:text-brand-400">Odatlar</Link>
                            <span className="text-gray-300 dark:text-gray-700">•</span>
                            <Link to="/gifts" className="text-xs text-brand-600 hover:underline dark:text-brand-400">Sovg'alar</Link>
                            <span className="text-gray-300 dark:text-gray-700">•</span>
                            <Link to="/roadmap-templates" className="text-xs text-brand-600 hover:underline dark:text-brand-400">Roadmaplar</Link>
                            <span className="text-gray-300 dark:text-gray-700">•</span>
                            <Link to="/interest-quiz" className="text-xs text-brand-600 hover:underline dark:text-brand-400">Test</Link>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
                        <div className="flex items-center gap-2">
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">
                                <FolderIcon className="h-4 w-4" />
                            </span>
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                                B2B & Moliya
                            </h3>
                        </div>
                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                            O'quv markazlari, biznes domenlari, to'lov tizimlari va obuna tariflari.
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                            <Link to="/businesses" className="text-xs text-brand-600 hover:underline dark:text-brand-400">Bizneslar</Link>
                            <span className="text-gray-300 dark:text-gray-700">•</span>
                            <Link to="/platform-payment-settings" className="text-xs text-brand-600 hover:underline dark:text-brand-400">To'lovlar</Link>
                            <span className="text-gray-300 dark:text-gray-700">•</span>
                            <Link to="/subscription-plans" className="text-xs text-brand-600 hover:underline dark:text-brand-400">Obunalar</Link>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
                        <div className="flex items-center gap-2">
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-300">
                                <UserCircleIcon className="h-4 w-4" />
                            </span>
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                                Tizim & Boshqaruv
                            </h3>
                        </div>
                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                            Xodimlar rollari, ruxsatnomalar, ilova tarjimalari va push xabarnomalar.
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                            <Link to="/roles" className="text-xs text-brand-600 hover:underline dark:text-brand-400">Lavozimlar</Link>
                            <span className="text-gray-300 dark:text-gray-700">•</span>
                            <Link to="/taxonomy" className="text-xs text-brand-600 hover:underline dark:text-brand-400">Taxonomy</Link>
                            <span className="text-gray-300 dark:text-gray-700">•</span>
                            <Link to="/app-translations" className="text-xs text-brand-600 hover:underline dark:text-brand-400">Tarjimalar</Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
