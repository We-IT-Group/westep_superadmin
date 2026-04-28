import {useMemo, useState} from "react";
import {Modal} from "../ui/modal";
import Button from "../ui/button/Button.tsx";
import ComponentCard from "../common/ComponentCard.tsx";
import PaymentSettingsFormModal from "./PaymentSettingsFormModal.tsx";
import StatusToast from "./StatusToast.tsx";
import {
    useCreateBusinessPaymentSetting,
    useGetBusinessPaymentSettings,
    useGetEffectiveBusinessPaymentSettings,
    useUpdateBusinessPaymentSetting
} from "../../api/paymentSettings/usePaymentSettings.ts";
import {Business, PaymentSettings, PaymentSettingsFormValues} from "../../types/types.ts";

function SettingsBadge({
                           label,
                           tone = "gray",
                       }: {
    label: string;
    tone?: "blue" | "green" | "orange" | "gray";
}) {
    const toneClass = {
        blue: "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300",
        green: "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-300",
        orange: "bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-300",
        gray: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    }[tone];

    return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${toneClass}`}>{label}</span>;
}

function formatValue(value?: string | number | null, fallback = "—") {
    if (value === null || value === undefined || value === "") return fallback;
    return String(value);
}

function SettingCard({
                         setting,
                         onEdit,
                     }: {
    setting: PaymentSettings;
    onEdit?: (setting: PaymentSettings) => void;
}) {
    return (
        <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-base font-semibold text-gray-900 dark:text-white">
                            {setting.displayName || setting.provider}
                        </h4>
                        <SettingsBadge label={setting.provider} tone="blue"/>
                        <SettingsBadge
                            label={setting.sourceType === "PLATFORM_DEFAULT" ? "Platform Default" : "Business"}
                            tone={setting.sourceType === "PLATFORM_DEFAULT" ? "orange" : "green"}
                        />
                    </div>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Mode: {setting.mode} | Login: {formatValue(setting.login)}
                    </p>
                </div>
                {onEdit && (
                    <Button size="sm" variant="outline" onClick={() => onEdit(setting)}>
                        Edit
                    </Button>
                )}
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
                <div>
                    <p className="text-gray-500 dark:text-gray-400">Merchant ID</p>
                    <p className="font-medium text-gray-900 dark:text-white">{formatValue(setting.merchantId)}</p>
                </div>
                <div>
                    <p className="text-gray-500 dark:text-gray-400">Callback URL</p>
                    <p className="font-medium text-gray-900 dark:text-white break-all">{formatValue(setting.callbackUrl)}</p>
                </div>
                <div>
                    <p className="text-gray-500 dark:text-gray-400">Priority</p>
                    <p className="font-medium text-gray-900 dark:text-white">{formatValue(setting.priority, "0")}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <SettingsBadge label={setting.active ? "Active" : "Inactive"} tone={setting.active ? "green" : "gray"}/>
                    <SettingsBadge label={setting.primaryConfig ? "Primary" : "Secondary"} tone={setting.primaryConfig ? "blue" : "gray"}/>
                    <SettingsBadge label={setting.secretConfigured ? "Secret Configured" : "Secret Missing"} tone={setting.secretConfigured ? "green" : "orange"}/>
                </div>
            </div>
        </div>
    );
}

interface Props {
    business: Business | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function BusinessPaymentSettingsModal({business, isOpen, onClose}: Props) {
    const businessId = business?.id;
    const [editingSetting, setEditingSetting] = useState<PaymentSettings | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

    const {data: businessSettings = [], isPending: isBusinessPending} = useGetBusinessPaymentSettings(businessId, isOpen);
    const {data: effectiveSettings = [], isPending: isEffectivePending} = useGetEffectiveBusinessPaymentSettings(businessId, isOpen);
    const {mutateAsync: createBusinessSetting, isPending: isCreatePending} = useCreateBusinessPaymentSetting();
    const {mutateAsync: updateBusinessSetting, isPending: isUpdatePending} = useUpdateBusinessPaymentSetting();

    const isUsingPlatformDefault = useMemo(
        () => businessSettings.length === 0 && effectiveSettings.some((item) => item.sourceType === "PLATFORM_DEFAULT"),
        [businessSettings, effectiveSettings],
    );

    const hasBusinessOverride = useMemo(
        () => effectiveSettings.some((item) => item.sourceType === "BUSINESS"),
        [effectiveSettings],
    );

    const handleCreate = () => {
        setEditingSetting(null);
        setIsFormOpen(true);
    };

    const handleEdit = (setting: PaymentSettings) => {
        setEditingSetting(setting);
        setIsFormOpen(true);
    };

    const handleSubmit = async (values: PaymentSettingsFormValues) => {
        if (!businessId) return;

        try {
            if (editingSetting?.id) {
                await updateBusinessSetting({businessId, id: editingSetting.id, values});
                setToast({message: "Business payment setting yangilandi", type: "success"});
            } else {
                await createBusinessSetting({businessId, values});
                setToast({message: "Business payment setting yaratildi", type: "success"});
            }
        } catch (error) {
            setToast({
                message: error instanceof Error ? error.message : "Payment settings saqlanmadi",
                type: "error",
            });
            throw error;
        }
    };

    return (
        <>
            {toast && <StatusToast message={toast.message} type={toast.type} onClose={() => setToast(null)}/>}
            <Modal isOpen={isOpen} onClose={onClose} className="max-w-[1100px] m-4 p-6 sm:p-8">
                <div className="space-y-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Payment Settings: {business?.name}
                            </h3>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                Business-level override va effective payment provider konfiguratsiyasi.
                            </p>
                        </div>
                        <Button size="sm" onClick={handleCreate}>
                            Add Setting
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                        <ComponentCard title="Business Settings" desc="Faqat shu businessga yozilgan konfiguratsiyalar">
                            {isBusinessPending ? (
                                <p className="text-sm text-gray-500 dark:text-gray-400">Yuklanmoqda...</p>
                            ) : businessSettings.length === 0 ? (
                                <div className="rounded-xl border border-dashed border-gray-300 px-4 py-6 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
                                    Bu business uchun alohida payment setting yo'q.
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {businessSettings.map((setting) => (
                                        <SettingCard key={setting.id} setting={setting} onEdit={handleEdit}/>
                                    ))}
                                </div>
                            )}
                        </ComponentCard>

                        <ComponentCard title="Effective Settings" desc="Backend resolve qilgan real ishlayotgan konfiguratsiya">
                            <div className="flex flex-wrap gap-2">
                                {isUsingPlatformDefault && (
                                    <SettingsBadge label="Platform default is being used" tone="orange"/>
                                )}
                                {hasBusinessOverride && (
                                    <SettingsBadge label="Business override is active" tone="green"/>
                                )}
                            </div>

                            {isEffectivePending ? (
                                <p className="text-sm text-gray-500 dark:text-gray-400">Yuklanmoqda...</p>
                            ) : effectiveSettings.length === 0 ? (
                                <div className="rounded-xl border border-dashed border-gray-300 px-4 py-6 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
                                    No payment provider configured
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {effectiveSettings.map((setting) => (
                                        <SettingCard key={setting.id} setting={setting}/>
                                    ))}
                                </div>
                            )}
                        </ComponentCard>
                    </div>
                </div>
            </Modal>

            <PaymentSettingsFormModal
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                setting={editingSetting}
                onSubmit={handleSubmit}
                isPending={isCreatePending || isUpdatePending}
                title={editingSetting ? "Edit Business Payment Setting" : "Create Business Payment Setting"}
            />
        </>
    );
}
