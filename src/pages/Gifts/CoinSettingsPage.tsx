import {useEffect, useState} from "react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import Button from "../../components/ui/button/Button.tsx";
import StatusToast from "../../components/paymentSettings/StatusToast.tsx";
import {CoinSettingsDto} from "../../api/gifts/giftApi.ts";
import {useCoinSettings, useSaveCoinSettings} from "../../api/gifts/useGifts.ts";
import {DollarLineIcon, ShootingStarIcon, VideoIcon} from "../../icons";

export default function CoinSettingsPage() {
    const {data} = useCoinSettings();
    const {mutateAsync: save, isPending} = useSaveCoinSettings();
    const [draft, setDraft] = useState<CoinSettingsDto | null>(null);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

    useEffect(() => {
        if (data) setDraft({...data});
    }, [data]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!draft) return;
        try {
            await save(draft);
            setToast({message: "Coin sozlamalari muvaffaqiyatli saqlandi", type: "success"});
        } catch (error) {
            setToast({message: error instanceof Error ? error.message : "Saqlashda xatolik", type: "error"});
        }
    };

    return (
        <>
            {toast && <StatusToast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            <PageMeta title="Coin sozlamalari | Westep Admin" description="Platforma coin iqtisodiyoti va qoidalari" />
            <PageBreadcrumb pageTitle="Coin sozlamalari" />

            <div className="space-y-6">
                {/* Header Banner */}
                <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
                    <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300">
                            <DollarLineIcon className="h-5 w-5" />
                        </span>
                        <div>
                            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                                Westep Coin Iqtisodiyoti
                            </h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Har bir dars, o'yin va takrorlash uchun beriladigan coinlar va kunlik suiiste'mol (abuse) limitlari
                            </p>
                        </div>
                    </div>
                </div>

                {draft && (
                    <form onSubmit={handleSave} className="space-y-6">
                        {/* Section 1: Lessons & Video Rewatch */}
                        <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
                            <div className="flex items-center gap-2 border-b border-gray-100 pb-3 dark:border-gray-800">
                                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
                                    <VideoIcon className="h-4 w-4" />
                                </span>
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                                    Darslar va Video Takrorlash
                                </h3>
                            </div>

                            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                                <div>
                                    <label htmlFor="coin-lesson" className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                                        Dars uchun standart mukofot
                                    </label>
                                    <div className="relative mt-1.5">
                                        <input
                                            id="coin-lesson"
                                            type="number"
                                            min={0}
                                            value={draft.lessonDefault}
                                            onChange={(e) => setDraft({...draft, lessonDefault: Number(e.target.value)})}
                                            className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-3.5 pr-14 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                        />
                                        <span className="absolute inset-y-0 right-3 flex items-center text-xs font-medium text-gray-400">
                                            coin
                                        </span>
                                    </div>
                                    <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
                                        Darsda maxsus coin ko'rsatilmagan bo'lsa
                                    </p>
                                </div>

                                <div>
                                    <label htmlFor="coin-rewatch" className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                                        Takrorlash bonusi
                                    </label>
                                    <div className="relative mt-1.5">
                                        <input
                                            id="coin-rewatch"
                                            type="number"
                                            min={0}
                                            value={draft.rewatchBonus}
                                            onChange={(e) => setDraft({...draft, rewatchBonus: Number(e.target.value)})}
                                            className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-3.5 pr-14 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                        />
                                        <span className="absolute inset-y-0 right-3 flex items-center text-xs font-medium text-gray-400">
                                            coin
                                        </span>
                                    </div>
                                    <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
                                        Tugatilgan darsni qayta ko'rgani uchun
                                    </p>
                                </div>

                                <div>
                                    <label htmlFor="coin-rewatch-max" className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                                        Kunlik takrorlash chegarasi
                                    </label>
                                    <div className="relative mt-1.5">
                                        <input
                                            id="coin-rewatch-max"
                                            type="number"
                                            min={0}
                                            value={draft.rewatchDailyMax}
                                            onChange={(e) => setDraft({...draft, rewatchDailyMax: Number(e.target.value)})}
                                            className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-3.5 pr-14 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                        />
                                        <span className="absolute inset-y-0 right-3 flex items-center text-xs font-medium text-gray-400">
                                            marta
                                        </span>
                                    </div>
                                    <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
                                        Kuniga ko'pi bilan necha marta bonus beriladi
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Educational Games & Quizzes */}
                        <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
                            <div className="flex items-center gap-2 border-b border-gray-100 pb-3 dark:border-gray-800">
                                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300">
                                    <ShootingStarIcon className="h-4 w-4" />
                                </span>
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                                    O'yinlar va Mini-Mashqlar
                                </h3>
                            </div>

                            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                <div>
                                    <label htmlFor="game-full-th" className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                                        To'liq natija chegarasi
                                    </label>
                                    <div className="relative mt-1.5">
                                        <input
                                            id="game-full-th"
                                            type="number"
                                            min={0}
                                            max={100}
                                            value={draft.gameFullThreshold}
                                            onChange={(e) => setDraft({...draft, gameFullThreshold: Number(e.target.value)})}
                                            className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-3.5 pr-10 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                        />
                                        <span className="absolute inset-y-0 right-3 flex items-center text-xs font-medium text-gray-400">%</span>
                                    </div>
                                    <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">To'liq mukofot olish foizi</p>
                                </div>

                                <div>
                                    <label htmlFor="game-full-rw" className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                                        To'liq natija mukofoti
                                    </label>
                                    <div className="relative mt-1.5">
                                        <input
                                            id="game-full-rw"
                                            type="number"
                                            min={0}
                                            value={draft.gameFullReward}
                                            onChange={(e) => setDraft({...draft, gameFullReward: Number(e.target.value)})}
                                            className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-3.5 pr-14 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                        />
                                        <span className="absolute inset-y-0 right-3 flex items-center text-xs font-medium text-gray-400">coin</span>
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="game-half-th" className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                                        Yarim natija chegarasi
                                    </label>
                                    <div className="relative mt-1.5">
                                        <input
                                            id="game-half-th"
                                            type="number"
                                            min={0}
                                            max={100}
                                            value={draft.gameHalfThreshold}
                                            onChange={(e) => setDraft({...draft, gameHalfThreshold: Number(e.target.value)})}
                                            className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-3.5 pr-10 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                        />
                                        <span className="absolute inset-y-0 right-3 flex items-center text-xs font-medium text-gray-400">%</span>
                                    </div>
                                    <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">Yarim mukofot olish foizi</p>
                                </div>

                                <div>
                                    <label htmlFor="game-half-rw" className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                                        Yarim natija mukofoti
                                    </label>
                                    <div className="relative mt-1.5">
                                        <input
                                            id="game-half-rw"
                                            type="number"
                                            min={0}
                                            value={draft.gameHalfReward}
                                            onChange={(e) => setDraft({...draft, gameHalfReward: Number(e.target.value)})}
                                            className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-3.5 pr-14 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                        />
                                        <span className="absolute inset-y-0 right-3 flex items-center text-xs font-medium text-gray-400">coin</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Safety & Daily Abuse Limit */}
                        <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
                            <div className="flex items-center gap-2 border-b border-gray-100 pb-3 dark:border-gray-800">
                                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-300">
                                    🛡️
                                </span>
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                                    Xavfsizlik va Kunlik Maksimum Limit
                                </h3>
                            </div>

                            <div className="mt-4 max-w-sm">
                                <label htmlFor="daily-limit" className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                                    Kunlik maksimum yig'ish limiti
                                </label>
                                <div className="relative mt-1.5">
                                    <input
                                        id="daily-limit"
                                        type="number"
                                        min={0}
                                        value={draft.dailyEarnLimit}
                                        onChange={(e) => setDraft({...draft, dailyEarnLimit: Number(e.target.value)})}
                                        className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-3.5 pr-14 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                    />
                                    <span className="absolute inset-y-0 right-3 flex items-center text-xs font-medium text-gray-400">coin</span>
                                </div>
                                <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
                                    Bitta o'quvchi bir kunda ishlab topishi mumkin bo'lgan maksimal coin chegarasi
                                </p>
                            </div>
                        </div>

                        {/* Action Submit Button */}
                        <div className="flex items-center justify-end gap-3 pt-2">
                            <Button type="submit" isPending={isPending} className="px-6">
                                Sozlamalarni saqlash
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </>
    );
}
