import {Link, useLocation} from "react-router";

interface GrowthNavProps {
    title: string;
    subtitle?: string;
    action?: React.ReactNode;
}

export default function GrowthNav({title, subtitle, action}: GrowthNavProps) {
    const location = useLocation();

    const tabs = [
        {name: "Reja (8 hafta)", path: "/growth/plan", icon: "📋"},
        {name: "Ko'rsatkichlar", path: "/growth/metrics", icon: "📊"},
        {name: "Kunlik marketing", path: "/growth/marketing", icon: "📢"},
        {name: "Xususiy maktablar", path: "/growth/schools", icon: "🏫"},
    ];

    return (
        <div className="mb-6 space-y-4">
            {/* Sarlavha va tezkor harakat tugmasi */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                            Boshqaruv markazi · 8 hafta
                        </span>
                        <span className="text-xs text-gray-400">6-okt — 29-noy, 2026</span>
                    </div>
                    <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                        {title}
                    </h1>
                    {subtitle && (
                        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                            {subtitle}
                        </p>
                    )}
                </div>

                {action && <div className="flex items-center gap-2 shrink-0">{action}</div>}
            </div>

            {/* Qulay gorizontal boshqaruv tablari (Linear/Vercel uslubidagi navigatsiya) */}
            <div className="border-b border-gray-200 dark:border-gray-800">
                <nav className="-mb-px flex space-x-1 sm:space-x-4 overflow-x-auto py-1 scrollbar-none" aria-label="Bo'limlar">
                    {tabs.map((tab) => {
                        const isActive = location.pathname === tab.path;
                        return (
                            <Link
                                key={tab.path}
                                to={tab.path}
                                className={`group inline-flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                                    isActive
                                        ? "bg-brand-50 text-brand-600 shadow-xs dark:bg-brand-500/10 dark:text-brand-400 font-semibold"
                                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800/60 dark:hover:text-gray-200"
                                }`}
                            >
                                <span>{tab.icon}</span>
                                <span>{tab.name}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </div>
    );
}
