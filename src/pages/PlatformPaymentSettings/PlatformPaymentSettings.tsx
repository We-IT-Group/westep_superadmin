import {useMemo, useState} from "react";
import {ColumnDef} from "@tanstack/react-table";
import {useNavigate} from "react-router";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import CommonTable from "../../components/tables/CommonTable/CommonTable.tsx";
import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import Button from "../../components/ui/button/Button.tsx";
import StatusToast from "../../components/paymentSettings/StatusToast.tsx";
import {Business, PaymentSettings} from "../../types/types.ts";
import {
    useGetBusinessPaymentSettings,
    useGetEffectiveBusinessPaymentSettings,
} from "../../api/paymentSettings/usePaymentSettings.ts";
import {useGetBusinesses} from "../../api/business/useBusiness.ts";
import {
    formatValue,
    getActiveCredentialWarning,
    getModeDescription,
    getModeTone,
    SettingsBadge
} from "../../components/paymentSettings/paymentSettingsShared.tsx";

function InfoPanel({
    setting,
    isEditable = false,
    onEdit,
}: {
    setting: PaymentSettings;
    isEditable?: boolean;
    onEdit?: (setting: PaymentSettings) => void;
}) {
    const warningMessage = getActiveCredentialWarning(setting);

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-base font-semibold text-gray-900 dark:text-white">
                            {setting.displayName || setting.provider}
                        </h4>
                        <SettingsBadge label={setting.provider} tone="blue"/>
                        <SettingsBadge label={setting.mode} tone={getModeTone(setting.mode)}/>
                        {setting.sourceType && (
                            <SettingsBadge
                                label={setting.sourceType === "BUSINESS" ? "Business" : "Platform default"}
                                tone={setting.sourceType === "BUSINESS" ? "green" : "orange"}
                            />
                        )}
                    </div>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{getModeDescription(setting.mode)}</p>
                </div>
                {isEditable && onEdit && (
                    <Button size="sm" variant="outline" onClick={() => onEdit(setting)}>
                        Tahrirlash
                    </Button>
                )}
            </div>

            {warningMessage && (
                <div className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                    {warningMessage}
                </div>
            )}

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Active mode</p>
                    <p className="mt-1 text-sm font-semibold text-slate-950 dark:text-slate-100">{setting.mode}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Effective merchantId</p>
                    <p className="mt-1 text-sm font-semibold text-slate-950 dark:text-slate-100">{formatValue(setting.merchantId)}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Effective login</p>
                    <p className="mt-1 text-sm font-semibold text-slate-950 dark:text-slate-100">{formatValue(setting.login)}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
                    <p className="text-xs text-slate-500 dark:text-slate-400">SourceType</p>
                    <p className="mt-1 text-sm font-semibold text-slate-950 dark:text-slate-100">{formatValue(setting.sourceType)}</p>
                </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Callback URL</p>
                    <p className="mt-1 break-all text-sm font-medium text-slate-950 dark:text-slate-100">{formatValue(setting.callbackUrl)}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <SettingsBadge label={setting.active ? "Faol" : "Nofaol"} tone={setting.active ? "green" : "gray"}/>
                    <SettingsBadge label={setting.primaryConfig ? "Asosiy" : "Qo'shimcha"} tone={setting.primaryConfig ? "blue" : "gray"}/>
                </div>
            </div>
        </div>
    );
}

function ExplanationBanner({sourceType}: { sourceType?: PaymentSettings["sourceType"] | null }) {
    if (sourceType === "BUSINESS") {
        return (
            <div className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700 dark:bg-green-500/10 dark:text-green-300">
                Bu business o'z kassasi bilan ishlayapti.
            </div>
        );
    }

    if (sourceType === "PLATFORM_DEFAULT") {
        return (
            <div className="rounded-xl bg-orange-50 px-4 py-3 text-sm text-orange-700 dark:bg-orange-500/10 dark:text-orange-300">
                Bu business uchun alohida kassa yo'q, platform default ishlayapti.
            </div>
        );
    }

    return null;
}

export default function PlatformPaymentSettingsPage() {
    const navigate = useNavigate();
    const {data: businesses = [], isPending: isBusinessesPending} = useGetBusinesses();

    const [selectedBusinessId, setSelectedBusinessId] = useState<string>("");
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

    const selectedBusiness = useMemo(
        () => businesses.find((business) => business.id === selectedBusinessId) || null,
        [businesses, selectedBusinessId],
    );

    const {
        data: businessSettings = [],
        isPending: isBusinessPending,
        error: businessSettingsError,
    } = useGetBusinessPaymentSettings(selectedBusinessId || undefined, Boolean(selectedBusinessId));

    const {
        data: effectiveBusinessSettings = [],
        isPending: isEffectivePending,
        error: effectiveSettingsError,
    } = useGetEffectiveBusinessPaymentSettings(selectedBusinessId || undefined, Boolean(selectedBusinessId));

    const permissionMessage = useMemo(() => {
        const errors = [businessSettingsError, effectiveSettingsError];
        const matchedError = errors.find((error) => error instanceof Error && error.message.includes("ruxsat"));
        return matchedError instanceof Error ? matchedError.message : null;
    }, [businessSettingsError, effectiveSettingsError]);

    const effectivePrimarySetting = effectiveBusinessSettings[0] || null;

    const businessColumns: ColumnDef<Business>[] = [
        {
            accessorKey: "name",
            header: "Business",
        },
        {
            accessorKey: "ownerFullName",
            header: "Egasi",
            cell: ({row}) => formatValue(row.original.ownerFullName),
        },
        {
            accessorKey: "studentsCount",
            header: "Talabalar",
            cell: ({row}) => row.original.studentsCount ?? 0,
        },
        {
            id: "paymentStatus",
            header: "To'lov sozlamasi",
            cell: ({row}) => (
                <Button
                    size="sm"
                    variant={selectedBusinessId === row.original.id ? "primary" : "outline"}
                    onClick={() => {
                        setSelectedBusinessId(row.original.id);
                        navigate(`/platform-payment-settings/${row.original.id}`);
                    }}
                >
                    {selectedBusinessId === row.original.id ? "Sozlanmoqda" : "Sozlash"}
                </Button>
            ),
        },
    ];

    return (
        <>
            {toast && <StatusToast message={toast.message} type={toast.type} onClose={() => setToast(null)}/>}
            <PageMeta title="Payment settings" description="Platform default va business payment settings boshqaruvi"/>
            <PageBreadcrumb pageTitle="Payment settings"/>

            <div className="mx-auto max-w-[1320px] space-y-4 pb-10">
                {permissionMessage && (
                    <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">
                        {permissionMessage}
                    </div>
                )}

                <ComponentCard
                    title="Platform top-up kassasi"
                    desc="Business wallet top-up uchun ishlatiladigan platform default Payme kassani shu yerdan boshqarasiz."
                    className="border-slate-200 shadow-sm dark:border-slate-800 dark:bg-slate-950"
                >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            `BUSINESS_WALLET_TOP_UP` usage bo'lgan platform-level Payme setting faqat business wallet hisobini to'ldirish uchun ishlatiladi.
                        </p>
                        <Button size="sm" onClick={() => navigate("/platform-payment-settings/top-up")}>
                            Top-up kassani sozlash
                        </Button>
                    </div>
                </ComponentCard>

                <ComponentCard
                    title="Bizneslar ro'yxati"
                    desc="Businessni tanlang va shu biznes uchun alohida kassa ID, test/prod key hamda mode ni sozlang."
                    className="border-slate-200 shadow-sm dark:border-slate-800 dark:bg-slate-950"
                >
                    <CommonTable data={businesses} columns={businessColumns} isPending={isBusinessesPending}/>

                    {selectedBusiness && (
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                <div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Tanlangan business</p>
                                    <h3 className="mt-1 text-base font-semibold text-slate-950 dark:text-slate-100">{selectedBusiness.name}</h3>
                                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                                        Shu business uchun alohida kassa ID, test/prod secret va active mode ni alohida sahifada sozlaysiz.
                                    </p>
                                </div>
                                <Button size="sm" onClick={() => navigate(`/platform-payment-settings/${selectedBusinessId}`)} disabled={!selectedBusinessId}>
                                    To'lovni sozlash
                                </Button>
                            </div>
                        </div>
                    )}

                    {!selectedBusinessId ? (
                        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
                            Avval businessni tanlang, keyin shu biznes uchun alohida kassa ID, test/prod key va mode ni kiritish qismi shu yerda ochiladi.
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                                <ComponentCard title="To'lov sozlamalari" desc="Shu business uchun saqlangan Payme kassa ma'lumotlari">
                                    {isBusinessPending ? (
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Yuklanmoqda...</p>
                                    ) : businessSettings.length === 0 ? (
                                        <div className="rounded-xl border border-dashed border-gray-300 px-4 py-6 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
                                            Bu business uchun hali alohida to'lov sozlamasi kiritilmagan.
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {businessSettings.map((setting) => (
                                                <InfoPanel key={setting.id} setting={setting}/>
                                            ))}
                                        </div>
                                    )}
                                </ComponentCard>

                                <ComponentCard title="Ishlayotgan kassa" desc="Hozir backend aynan qaysi credential bilan ishlayotganini ko'rsatadi">
                                    {effectivePrimarySetting && <ExplanationBanner sourceType={effectivePrimarySetting.sourceType}/>}

                                    {isEffectivePending ? (
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Yuklanmoqda...</p>
                                    ) : effectiveBusinessSettings.length === 0 ? (
                                        <div className="rounded-xl border border-dashed border-gray-300 px-4 py-6 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
                                            Bu business uchun effective payment setting topilmadi.
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {effectiveBusinessSettings.map((setting) => (
                                                <InfoPanel key={setting.id} setting={setting}/>
                                            ))}
                                        </div>
                                    )}
                                </ComponentCard>
                            </div>

                        </>
                    )}
                </ComponentCard>
            </div>
        </>
    );
}
