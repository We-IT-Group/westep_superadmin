import {useMemo, useState} from "react";
import {useNavigate, useParams} from "react-router";
import {useFormik} from "formik";
import * as Yup from "yup";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import Button from "../../components/ui/button/Button.tsx";
import StatusToast from "../../components/paymentSettings/StatusToast.tsx";
import Label from "../../components/form/Label.tsx";
import {useGetBusinesses} from "../../api/business/useBusiness.ts";
import {
    useCreateBusinessPaymentSetting,
    useGetBusinessPaymentSettings,
    useGetEffectiveBusinessPaymentSettings,
    useUpdateBusinessPaymentSetting
} from "../../api/paymentSettings/usePaymentSettings.ts";
import {PaymentMode, PaymentSettings, PaymentSettingsFormValues, PaymentProvider} from "../../types/types.ts";
import {
    formatValue,
    getActiveCredentialWarning,
    getModeDescription,
    getModeTone,
    getSecretBadgeLabel,
    SettingsBadge
} from "../../components/paymentSettings/paymentSettingsShared.tsx";

const providerOptions: PaymentProvider[] = ["PAYME", "CLICK", "UZUM", "STRIPE"];
const modeOptions: PaymentMode[] = ["TEST", "PROD"];
type CredentialConfig = {
    mode: PaymentMode;
    merchantField: "testMerchantId" | "prodMerchantId";
    loginField: "testLogin" | "prodLogin";
    secretField: "testSecretKey" | "prodSecretKey";
    secretConfigured: boolean;
};

const createInitialValues = (setting?: PaymentSettings | null): PaymentSettingsFormValues => ({
    provider: setting?.provider || "PAYME",
    displayName: setting?.displayName || "",
    active: setting?.active ?? true,
    primaryConfig: setting?.primaryConfig ?? false,
    mode: setting?.mode || "TEST",
    merchantId: setting?.merchantId || null,
    login: setting?.login || null,
    secretKey: null,
    testMerchantId: setting?.testMerchantId || "",
    testLogin: setting?.testLogin || "",
    testSecretKey: "",
    prodMerchantId: setting?.prodMerchantId || "",
    prodLogin: setting?.prodLogin || "",
    prodSecretKey: "",
    callbackUrl: setting?.callbackUrl || "",
    priority: setting?.priority ?? 0,
});

function getModeRecommendation(mode: PaymentMode, values: PaymentSettingsFormValues) {
    if (mode === "TEST" && (!values.testMerchantId.trim() || !values.testLogin.trim())) {
        return "TEST rejim uchun test merchant ID va login to'ldirilishi tavsiya qilinadi.";
    }

    if (mode === "PROD" && (!values.prodMerchantId.trim() || !values.prodLogin.trim())) {
        return "PROD rejim uchun prod merchant ID va login to'ldirilishi tavsiya qilinadi.";
    }

    return null;
}

function InfoPanel({setting}: { setting: PaymentSettings }) {
    const warningMessage = getActiveCredentialWarning(setting);

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div className="flex flex-wrap items-center gap-2">
                <h4 className="text-base font-semibold text-slate-950 dark:text-slate-100">
                    {setting.displayName || setting.provider}
                </h4>
                <SettingsBadge label={setting.provider} tone="blue"/>
                <SettingsBadge label={setting.mode} tone={getModeTone(setting.mode)}/>
            </div>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{getModeDescription(setting.mode)}</p>

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
        </div>
    );
}

function Section({title, description, children}: { title: string; description?: string; children: React.ReactNode }) {
    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div className="mb-4">
                <h4 className="text-sm font-semibold text-slate-950 dark:text-slate-100">{title}</h4>
                {description && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{description}</p>}
            </div>
            {children}
        </section>
    );
}

export default function BusinessPaymentSettingsPage() {
    const navigate = useNavigate();
    const {businessId = ""} = useParams();
    const {data: businesses = []} = useGetBusinesses();
    const selectedBusiness = useMemo(
        () => businesses.find((business) => business.id === businessId) || null,
        [businesses, businessId],
    );
    const {data: businessSettings = [], isPending: isBusinessPending} = useGetBusinessPaymentSettings(businessId, Boolean(businessId));
    const {data: effectiveBusinessSettings = [], isPending: isEffectivePending} = useGetEffectiveBusinessPaymentSettings(businessId, Boolean(businessId));
    const {mutateAsync: createBusinessSetting, isPending: isCreatePending} = useCreateBusinessPaymentSetting();
    const {mutateAsync: updateBusinessSetting, isPending: isUpdatePending} = useUpdateBusinessPaymentSetting();

    const currentSetting = businessSettings[0] || null;
    const effectiveSetting = effectiveBusinessSettings[0] || null;
    const recommendationSetting = currentSetting || effectiveSetting || null;
    const initialValues = useMemo(() => createInitialValues(currentSetting || effectiveSetting), [currentSetting, effectiveSetting]);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

    const formik = useFormik({
        initialValues,
        enableReinitialize: true,
        validationSchema: Yup.object({
            provider: Yup.string().required("Provider tanlanishi kerak"),
            displayName: Yup.string().trim(),
            active: Yup.boolean().required(),
            primaryConfig: Yup.boolean().required(),
            mode: Yup.string().oneOf(modeOptions).required("Active mode tanlanishi kerak"),
            testMerchantId: Yup.string().trim(),
            testLogin: Yup.string().trim(),
            testSecretKey: Yup.string().trim(),
            prodMerchantId: Yup.string().trim(),
            prodLogin: Yup.string().trim(),
            prodSecretKey: Yup.string().trim(),
            callbackUrl: Yup.string()
                .trim()
                .test("url-format", "Callback URL noto'g'ri", (value) => {
                    if (!value?.trim()) return true;
                    try {
                        new URL(value);
                        return true;
                    } catch {
                        return false;
                    }
                }),
            priority: Yup.number().typeError("Ustuvorlik raqam bo'lishi kerak").required("Ustuvorlik kiritilishi kerak"),
        }),
        onSubmit: async (values) => {
            try {
                const payload: PaymentSettingsFormValues = {
                    ...values,
                    displayName: values.displayName.trim(),
                    testMerchantId: values.testMerchantId.trim(),
                    testLogin: values.testLogin.trim(),
                    testSecretKey: values.testSecretKey.trim(),
                    prodMerchantId: values.prodMerchantId.trim(),
                    prodLogin: values.prodLogin.trim(),
                    prodSecretKey: values.prodSecretKey.trim(),
                    callbackUrl: values.callbackUrl.trim(),
                    priority: Number(values.priority),
                };

                if (currentSetting?.id) {
                    await updateBusinessSetting({businessId, id: currentSetting.id, values: payload});
                    setToast({message: "Business uchun to'lov sozlamasi yangilandi", type: "success"});
                } else {
                    await createBusinessSetting({businessId, values: payload});
                    setToast({message: "Business uchun to'lov sozlamasi saqlandi", type: "success"});
                }
            } catch (error) {
                setToast({message: error instanceof Error ? error.message : "Business uchun to'lov sozlamasi saqlanmadi", type: "error"});
            }
        },
    });

    const activeMode = formik.values.mode;
    const recommendation = getModeRecommendation(activeMode, formik.values);
    const inputClassName =
        "h-11 w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm shadow-theme-xs focus:outline-hidden focus:ring-3 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";

    return (
        <>
            {toast && <StatusToast message={toast.message} type={toast.type} onClose={() => setToast(null)}/>}
            <PageMeta title="Business payment settings" description="Business uchun alohida kassa sozlamasi"/>
            <PageBreadcrumb pageTitle="Business payment settings"/>

            <div className="mx-auto max-w-[1320px] space-y-4 pb-10">
                <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold text-slate-950 dark:text-slate-100">
                                {selectedBusiness?.name || "Business payment settings"}
                            </h1>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                Shu business uchun alohida kassa ID, test/prod key va active mode ni shu sahifada sozlaysiz.
                            </p>
                        </div>
                        <Button variant="outline" onClick={() => navigate("/platform-payment-settings")}>
                            Ro'yxatga qaytish
                        </Button>
                    </div>
                </section>

                {recommendationSetting && <InfoPanel setting={recommendationSetting}/>}

                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        formik.handleSubmit();
                    }}
                    className="space-y-4"
                >
                    <Section title="Umumiy ma'lumotlar" description="Shu business uchun ishlatiladigan Payme settingning umumiy maydonlari.">
                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                            <div>
                                <Label htmlFor="provider">Provider</Label>
                                <select id="provider" name="provider" value={formik.values.provider} onChange={formik.handleChange} onBlur={formik.handleBlur} className={inputClassName}>
                                    {providerOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                                </select>
                            </div>
                            <div>
                                <Label htmlFor="displayName">Ko'rsatish nomi</Label>
                                <input id="displayName" name="displayName" value={formik.values.displayName} onChange={formik.handleChange} onBlur={formik.handleBlur} className={inputClassName} />
                            </div>
                            <div className="lg:col-span-2">
                                <Label htmlFor="callbackUrl">Callback URL</Label>
                                <input id="callbackUrl" name="callbackUrl" value={formik.values.callbackUrl} onChange={formik.handleChange} onBlur={formik.handleBlur} className={inputClassName}/>
                            </div>
                        </div>
                    </Section>

                    <Section title="Active mode" description="Qaysi credential checkout va callback uchun ishlashini shu yerdan tanlaysiz.">
                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                            {modeOptions.map((option) => {
                                const isSelected = formik.values.mode === option;
                                return (
                                    <button
                                        key={option}
                                        type="button"
                                        onClick={() => formik.setFieldValue("mode", option)}
                                        className={`rounded-2xl border p-5 text-left transition ${
                                            isSelected
                                                ? option === "PROD"
                                                    ? "border-red-300 bg-red-50 dark:border-red-500/40 dark:bg-red-500/10"
                                                    : "border-blue-300 bg-blue-50 dark:border-blue-500/40 dark:bg-blue-500/10"
                                                : "border-gray-200 bg-white hover:border-gray-300 dark:border-gray-800 dark:bg-white/[0.02]"
                                        }`}
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-base font-semibold text-gray-900 dark:text-white">{option}</span>
                                                    <SettingsBadge label={option} tone={getModeTone(option)}/>
                                                </div>
                                                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{getModeDescription(option)}</p>
                                            </div>
                                            {isSelected && <SettingsBadge label="Tanlangan" tone="blue"/>}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                        {recommendation && (
                            <div className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                                {recommendation}
                            </div>
                        )}
                    </Section>

                    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                        {([
                            {mode: "TEST", merchantField: "testMerchantId", loginField: "testLogin", secretField: "testSecretKey", secretConfigured: currentSetting?.testSecretConfigured ?? false},
                            {mode: "PROD", merchantField: "prodMerchantId", loginField: "prodLogin", secretField: "prodSecretKey", secretConfigured: currentSetting?.prodSecretConfigured ?? false},
                        ] as CredentialConfig[]).map((config) => (
                            <Section
                                key={config.mode}
                                title={`${config.mode} credentials`}
                                description={`Bo'sh qoldirilsa avvalgi ${config.mode.toLowerCase()} secret saqlanadi.`}
                            >
                                <div className="mb-3 flex flex-wrap items-center gap-2">
                                    <SettingsBadge label={config.mode} tone={getModeTone(config.mode)}/>
                                    <SettingsBadge label={getSecretBadgeLabel(config.secretConfigured)} tone={config.secretConfigured ? "green" : "orange"}/>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor={config.merchantField}>Merchant ID</Label>
                                        <input id={config.merchantField} name={config.merchantField} value={formik.values[config.merchantField]} onChange={formik.handleChange} onBlur={formik.handleBlur} className={inputClassName}/>
                                    </div>
                                    <div>
                                        <Label htmlFor={config.loginField}>Login</Label>
                                        <input id={config.loginField} name={config.loginField} value={formik.values[config.loginField]} onChange={formik.handleChange} onBlur={formik.handleBlur} className={inputClassName}/>
                                    </div>
                                    <div>
                                        <Label htmlFor={config.secretField}>Secret key</Label>
                                        <input id={config.secretField} name={config.secretField} type="password" value={formik.values[config.secretField]} onChange={formik.handleChange} onBlur={formik.handleBlur} className={inputClassName}/>
                                        <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">Bo'sh qoldirilsa avvalgi secret saqlanadi</p>
                                    </div>
                                </div>
                            </Section>
                        ))}
                    </div>

                    <Section title="Qo'shimcha sozlamalar">
                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_auto]">
                            <div>
                                <Label htmlFor="priority">Priority</Label>
                                <input id="priority" name="priority" type="number" value={formik.values.priority} onChange={formik.handleChange} onBlur={formik.handleBlur} className={inputClassName}/>
                            </div>
                            <div className="grid grid-cols-1 gap-3 rounded-2xl border border-gray-200 p-4 dark:border-gray-800">
                                <label className="flex items-center gap-3">
                                    <input type="checkbox" checked={formik.values.active} onChange={(event) => formik.setFieldValue("active", event.target.checked)} className="h-4 w-4 rounded border-gray-300 text-brand-500"/>
                                    <span className="text-sm text-gray-700 dark:text-gray-300">Faol</span>
                                </label>
                                <label className="flex items-center gap-3">
                                    <input type="checkbox" checked={formik.values.primaryConfig} onChange={(event) => formik.setFieldValue("primaryConfig", event.target.checked)} className="h-4 w-4 rounded border-gray-300 text-brand-500"/>
                                    <span className="text-sm text-gray-700 dark:text-gray-300">Asosiy konfiguratsiya</span>
                                </label>
                            </div>
                        </div>
                    </Section>

                    <div className="flex justify-end gap-3">
                        <Button type="button" variant="outline" onClick={() => navigate("/platform-payment-settings")}>
                            Bekor qilish
                        </Button>
                        <Button type="submit" isPending={isCreatePending || isUpdatePending} disabled={isCreatePending || isUpdatePending || isBusinessPending || isEffectivePending}>
                            Saqlash
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}
