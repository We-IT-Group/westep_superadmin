import {useEffect, useState} from "react";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import Button from "../../components/ui/button/Button.tsx";
import StatusToast from "../../components/paymentSettings/StatusToast.tsx";
import {CoinSettingsDto} from "../../api/gifts/giftApi.ts";
import {useCoinSettings, useSaveCoinSettings} from "../../api/gifts/useGifts.ts";

const FIELDS: Array<{ key: keyof CoinSettingsDto; label: string; hint: string }> = [
    {key: "lessonDefault", label: "Dars uchun (default)", hint: "Lesson.coinReward bo'sh bo'lsa ishlatiladi"},
    {key: "rewatchBonus", label: "Takrorlash bonusi", hint: "Tugatilgan darsni qayta ko'rish uchun"},
    {key: "rewatchDailyMax", label: "Takrorlash kunlik max", hint: "Kuniga necha marta bonus berilishi"},
    {key: "gameFullThreshold", label: "O'yin to'liq chegara (%)", hint: "Shu foizdan yuqori — to'liq mukofot"},
    {key: "gameFullReward", label: "O'yin to'liq mukofot", hint: ""},
    {key: "gameHalfThreshold", label: "O'yin yarim chegara (%)", hint: ""},
    {key: "gameHalfReward", label: "O'yin yarim mukofot", hint: ""},
    {key: "dailyEarnLimit", label: "Kunlik earn limiti", hint: "Abuse himoyasi — kuniga max ishlanadigan coin"},
];

export default function CoinSettingsPage() {
    const {data} = useCoinSettings();
    const {mutateAsync: save, isPending} = useSaveCoinSettings();
    const [draft, setDraft] = useState<CoinSettingsDto | null>(null);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

    useEffect(() => {
        if (data) setDraft({...data});
    }, [data]);

    const handleSave = async () => {
        if (!draft) return;
        try {
            await save(draft);
            setToast({message: "Sozlamalar saqlandi", type: "success"});
        } catch (error) {
            setToast({message: error instanceof Error ? error.message : "Xatolik", type: "error"});
        }
    };

    return (
        <>
            {toast && <StatusToast message={toast.message} type={toast.type} onClose={() => setToast(null)}/>}
            <PageMeta title="Coin sozlamalari" description="Coin miqdorlarini boshqarish"/>
            <PageBreadcrumb pageTitle="Coin sozlamalari"/>
            <div className="space-y-6">
                <ComponentCard title="Coin miqdorlari" desc="Har bir manba uchun beriladigan coin miqdori (13-qaror: hammasini admin belgilaydi)">
                    {draft && (
                        <div className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                {FIELDS.map((field) => (
                                    <div key={field.key}>
                                        <label className="mb-1 block text-sm text-gray-600 dark:text-gray-300">
                                            {field.label}
                                        </label>
                                        <input
                                            type="number"
                                            min={0}
                                            value={draft[field.key]}
                                            onChange={(e) => setDraft({
                                                ...draft,
                                                [field.key]: Number(e.target.value),
                                            })}
                                            className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                                        />
                                        {field.hint && (
                                            <p className="mt-1 text-xs text-gray-400">{field.hint}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <Button onClick={handleSave} isPending={isPending}>Saqlash</Button>
                        </div>
                    )}
                </ComponentCard>
            </div>
        </>
    );
}
