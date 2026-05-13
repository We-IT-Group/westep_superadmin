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
import {
    formatValue,
    getActiveCredentialWarning,
    getModeDescription,
    getModeTone,
    getSecretBadgeLabel,
    SettingsBadge
} from "./paymentSettingsShared.tsx";

function SettingCard({
    setting,
    onEdit,
}: {
    setting: PaymentSettings;
    onEdit?: (setting: PaymentSettings) => void;
}) {
    const warningMessage = getActiveCredentialWarning(setting);

    return (
        <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
            <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-base font-semibold text-gray-900 dark:text-white">
                            {setting.displayName || setting.provider}
                        </h4>
                        <SettingsBadge label={setting.provider} tone="blue"/>
                        <SettingsBadge label={setting.active ? "Faol" : "Nofaol"} tone={setting.active ? "green" : "gray"}/>
                        <SettingsBadge label={setting.primaryConfig ? "Asosiy" : "Qo'shimcha"} tone={setting.primaryConfig ? "blue" : "gray"}/>
                        <SettingsBadge label={setting.mode} tone={getModeTone(setting.mode)}/>
                        {setting.sourceType && (
                            <SettingsBadge
                                label={setting.sourceType === "PLATFORM_DEFAULT" ? "Platform default" : "Business"}
                                tone={setting.sourceType === "PLATFORM_DEFAULT" ? "orange" : "green"}
                            />
                        )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{getModeDescription(setting.mode)}</p>
                </div>
                {onEdit && (
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

            <div className="mt-4 grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                <div>
                    <p className="text-gray-500 dark:text-gray-400">Effective merchant ID</p>
                    <p className="font-medium text-gray-900 dark:text-white">{formatValue(setting.merchantId)}</p>
                </div>
                <div>
                    <p className="text-gray-500 dark:text-gray-400">Effective login</p>
                    <p className="font-medium text-gray-900 dark:text-white">{formatValue(setting.login)}</p>
                </div>
                <div className="md:col-span-2">
                    <p className="text-gray-500 dark:text-gray-400">Callback URL</p>
                    <p className="break-all font-medium text-gray-900 dark:text-white">{formatValue(setting.callbackUrl)}</p>
                </div>
                <div>
                    <p className="text-gray-500 dark:text-gray-400">Test merchant ID</p>
                    <p className="font-medium text-gray-900 dark:text-white">{formatValue(setting.testMerchantId)}</p>
                </div>
                <div>
                    <p className="text-gray-500 dark:text-gray-400">Test login</p>
                    <p className="font-medium text-gray-900 dark:text-white">{formatValue(setting.testLogin)}</p>
                </div>
                <div>
                    <p className="text-gray-500 dark:text-gray-400">Prod merchant ID</p>
                    <p className="font-medium text-gray-900 dark:text-white">{formatValue(setting.prodMerchantId)}</p>
                </div>
                <div>
                    <p className="text-gray-500 dark:text-gray-400">Prod login</p>
                    <p className="font-medium text-gray-900 dark:text-white">{formatValue(setting.prodLogin)}</p>
                </div>
                <div>
                    <p className="text-gray-500 dark:text-gray-400">Priority</p>
                    <p className="font-medium text-gray-900 dark:text-white">{formatValue(setting.priority, "0")}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <SettingsBadge
                        label={`Test: ${getSecretBadgeLabel(setting.testSecretConfigured)}`}
                        tone={setting.testSecretConfigured ? "green" : "orange"}
                    />
                    <SettingsBadge
                        label={`Prod: ${getSecretBadgeLabel(setting.prodSecretConfigured)}`}
                        tone={setting.prodSecretConfigured ? "green" : "orange"}
                    />
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

    const {
        data: businessSettings = [],
        isPending: isBusinessPending,
        error: businessError,
    } = useGetBusinessPaymentSettings(businessId, isOpen);
    const {
        data: effectiveSettings = [],
        isPending: isEffectivePending,
        error: effectiveError,
    } = useGetEffectiveBusinessPaymentSettings(businessId, isOpen);
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

    const permissionMessage = useMemo(() => {
        const errors = [businessError, effectiveError];
        const matchedError = errors.find((error) => error instanceof Error && error.message.includes("ruxsat"));
        return matchedError instanceof Error ? matchedError.message : null;
    }, [businessError, effectiveError]);

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
            <Modal isOpen={isOpen} onClose={onClose} className="max-w-[1200px] m-4 p-6 sm:p-8">
                <div className="space-y-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                To'lov sozlamalari: {business?.name}
                            </h3>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                Biznes override va backend hisoblagan effective Payme credentiallari shu yerda ko'rinadi.
                            </p>
                        </div>
                        <Button size="sm" onClick={handleCreate}>
                            Sozlama qo'shish
                        </Button>
                    </div>

                    {permissionMessage && (
                        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">
                            {permissionMessage}
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                        <ComponentCard title="Biznes sozlamalari" desc="Faqat shu biznesga yozilgan credentiallar">
                            {isBusinessPending ? (
                                <p className="text-sm text-gray-500 dark:text-gray-400">Yuklanmoqda...</p>
                            ) : businessSettings.length === 0 ? (
                                <div className="rounded-xl border border-dashed border-gray-300 px-4 py-6 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
                                    Bu biznes uchun alohida to'lov sozlamasi yo'q.
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {businessSettings.map((setting) => (
                                        <SettingCard key={setting.id} setting={setting} onEdit={handleEdit}/>
                                    ))}
                                </div>
                            )}
                        </ComponentCard>

                        <ComponentCard title="Effective settings" desc="Qaysi mode va qaysi merchant amalda ishlayotganini backend aniqlab beradi">
                            <div className="flex flex-wrap gap-2">
                                {isUsingPlatformDefault && (
                                    <SettingsBadge label="Platform default ishlayapti" tone="orange"/>
                                )}
                                {hasBusinessOverride && (
                                    <SettingsBadge label="Business override faol" tone="green"/>
                                )}
                            </div>

                            {isEffectivePending ? (
                                <p className="text-sm text-gray-500 dark:text-gray-400">Yuklanmoqda...</p>
                            ) : effectiveSettings.length === 0 ? (
                                <div className="rounded-xl border border-dashed border-gray-300 px-4 py-6 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
                                    To'lov provider sozlanmagan.
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
                title={editingSetting ? "Biznes to'lov sozlamasini tahrirlash" : "Biznes to'lov sozlamasini yaratish"}
            />
        </>
    );
}
