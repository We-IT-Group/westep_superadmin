import {useMemo} from "react";
import {useFormik} from "formik";
import * as Yup from "yup";
import {Modal} from "../ui/modal";
import Label from "../form/Label.tsx";
import Button from "../ui/button/Button.tsx";
import {PaymentMode, PaymentSettings, PaymentSettingsFormValues, PaymentProvider} from "../../types/types.ts";
import {
    formatValue,
    getModeDescription,
    getModeTone,
    getSecretBadgeLabel,
    SettingsBadge
} from "./paymentSettingsShared.tsx";

const providerOptions: PaymentProvider[] = ["PAYME", "CLICK", "UZUM", "STRIPE"];
const modeOptions: PaymentMode[] = ["TEST", "PROD"];

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

interface SectionProps {
    title: string;
    description?: string;
    children: React.ReactNode;
    className?: string;
}

function Section({title, description, children, className = ""}: SectionProps) {
    return (
        <section className={`rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.02] ${className}`}>
            <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h4>
                {description && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{description}</p>}
            </div>
            {children}
        </section>
    );
}

interface CredentialCardProps {
    mode: PaymentMode;
    isActive: boolean;
    merchantField: "testMerchantId" | "prodMerchantId";
    loginField: "testLogin" | "prodLogin";
    secretField: "testSecretKey" | "prodSecretKey";
    secretConfigured: boolean;
    formik: ReturnType<typeof useFormik<PaymentSettingsFormValues>>;
    inputClassName: string;
    isEdit: boolean;
}

function CredentialCard({
    mode,
    isActive,
    merchantField,
    loginField,
    secretField,
    secretConfigured,
    formik,
    inputClassName,
    isEdit,
}: CredentialCardProps) {
    const labelTone = getModeTone(mode);

    return (
        <div className={`rounded-2xl border p-5 transition ${
            isActive
                ? "border-brand-300 bg-brand-50/60 dark:border-brand-500/40 dark:bg-brand-500/10"
                : "border-gray-200 bg-gray-50/60 dark:border-gray-800 dark:bg-gray-900/40"
        }`}>
            <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                    <div className="flex flex-wrap items-center gap-2">
                        <h5 className="text-sm font-semibold text-gray-900 dark:text-white">{mode} credentials</h5>
                        <SettingsBadge label={mode} tone={labelTone}/>
                        {isActive && <SettingsBadge label="Aktiv" tone="blue"/>}
                    </div>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{getModeDescription(mode)}</p>
                </div>
                <SettingsBadge
                    label={getSecretBadgeLabel(secretConfigured)}
                    tone={secretConfigured ? "green" : "orange"}
                />
            </div>

            <div className="space-y-4">
                <div>
                    <Label htmlFor={merchantField}>Merchant ID</Label>
                    <input
                        id={merchantField}
                        name={merchantField}
                        value={formik.values[merchantField]}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className={inputClassName}
                        placeholder={mode === "TEST" ? "test-merchant" : "prod-merchant"}
                    />
                    {formik.touched[merchantField] && formik.errors[merchantField] && (
                        <p className="mt-1.5 text-xs text-error-500">{formik.errors[merchantField]}</p>
                    )}
                </div>

                <div>
                    <Label htmlFor={loginField}>Login</Label>
                    <input
                        id={loginField}
                        name={loginField}
                        value={formik.values[loginField]}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className={inputClassName}
                        placeholder="Paycom"
                    />
                    {formik.touched[loginField] && formik.errors[loginField] && (
                        <p className="mt-1.5 text-xs text-error-500">{formik.errors[loginField]}</p>
                    )}
                </div>

                <div>
                    <Label htmlFor={secretField}>Secret key</Label>
                    <input
                        id={secretField}
                        name={secretField}
                        type="password"
                        value={formik.values[secretField]}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className={inputClassName}
                        placeholder={isEdit ? "Bo'sh qoldirilsa avvalgi secret saqlanadi" : "Secret key"}
                    />
                    <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                        Bo'sh qoldirilsa avvalgi secret saqlanadi
                    </p>
                    {formik.touched[secretField] && formik.errors[secretField] && (
                        <p className="mt-1.5 text-xs text-error-500">{formik.errors[secretField]}</p>
                    )}
                </div>
            </div>
        </div>
    );
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (values: PaymentSettingsFormValues) => Promise<void>;
    setting?: PaymentSettings | null;
    isPending?: boolean;
    title: string;
}

export default function PaymentSettingsFormModal({
    isOpen,
    onClose,
    onSubmit,
    setting,
    isPending = false,
    title,
}: Props) {
    const isEdit = Boolean(setting?.id);
    const initialValues = useMemo(() => createInitialValues(setting), [setting]);

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
        onSubmit: async (values, helpers) => {
            try {
                await onSubmit({
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
                });
                helpers.resetForm();
                onClose();
            } catch {
                // toast parentda
            }
        },
    });

    const activeMode = formik.values.mode;
    const showPaymeFields = formik.values.provider === "PAYME";
    const recommendation = getModeRecommendation(activeMode, formik.values);

    const inputClassName =
        "h-11 w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm shadow-theme-xs focus:outline-hidden focus:ring-3 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-[1100px] m-4 p-5 sm:p-7">
            <div className="space-y-6">
                <div className="flex flex-col gap-4 rounded-3xl bg-gradient-to-r from-slate-50 to-blue-50 p-5 dark:from-gray-900 dark:to-gray-900/70">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h3>
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                Bir setting ichida test va prod kassani boshqaring, qaysi biri ishlashini esa `Active mode` orqali tanlang.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <SettingsBadge label={`Aktiv mode: ${setting?.mode || activeMode}`} tone={getModeTone(setting?.mode || activeMode)}/>
                            <SettingsBadge label={formik.values.active ? "Faol" : "Nofaol"} tone={formik.values.active ? "green" : "gray"}/>
                            <SettingsBadge label={formik.values.primaryConfig ? "Asosiy" : "Qo'shimcha"} tone={formik.values.primaryConfig ? "blue" : "gray"}/>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
                        <div className="rounded-2xl bg-white/80 p-4 dark:bg-white/[0.04]">
                            <p className="text-xs text-gray-500 dark:text-gray-400">Hozir ishlayotgan merchant</p>
                            <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">{formatValue(setting?.merchantId)}</p>
                        </div>
                        <div className="rounded-2xl bg-white/80 p-4 dark:bg-white/[0.04]">
                            <p className="text-xs text-gray-500 dark:text-gray-400">Hozir ishlayotgan login</p>
                            <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">{formatValue(setting?.login)}</p>
                        </div>
                        <div className="rounded-2xl bg-white/80 p-4 dark:bg-white/[0.04]">
                            <p className="text-xs text-gray-500 dark:text-gray-400">Test secret</p>
                            <div className="mt-2">
                                <SettingsBadge
                                    label={getSecretBadgeLabel(setting?.testSecretConfigured ?? false)}
                                    tone={setting?.testSecretConfigured ? "green" : "orange"}
                                />
                            </div>
                        </div>
                        <div className="rounded-2xl bg-white/80 p-4 dark:bg-white/[0.04]">
                            <p className="text-xs text-gray-500 dark:text-gray-400">Prod secret</p>
                            <div className="mt-2">
                                <SettingsBadge
                                    label={getSecretBadgeLabel(setting?.prodSecretConfigured ?? false)}
                                    tone={setting?.prodSecretConfigured ? "green" : "orange"}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        formik.handleSubmit();
                    }}
                    className="space-y-6"
                >
                    <Section title="Umumiy ma'lumotlar" description="Setting nomi, provider va callback kabi umumiy parametrlar.">
                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                            <div>
                                <Label htmlFor="provider">Provider</Label>
                                <select
                                    id="provider"
                                    name="provider"
                                    value={formik.values.provider}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    className={inputClassName}
                                >
                                    {providerOptions.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                                {formik.touched.provider && formik.errors.provider && (
                                    <p className="mt-1.5 text-xs text-error-500">{formik.errors.provider}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="displayName">Ko'rsatish nomi</Label>
                                <input
                                    id="displayName"
                                    name="displayName"
                                    value={formik.values.displayName}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    className={inputClassName}
                                    placeholder="Westep Payme"
                                />
                            </div>

                            <div className="lg:col-span-2">
                                <Label htmlFor="callbackUrl">Callback URL</Label>
                                <input
                                    id="callbackUrl"
                                    name="callbackUrl"
                                    value={formik.values.callbackUrl}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    className={inputClassName}
                                    placeholder="https://your-domain/api/payme/merchant"
                                />
                                {formik.touched.callbackUrl && formik.errors.callbackUrl && (
                                    <p className="mt-1.5 text-xs text-error-500">{formik.errors.callbackUrl}</p>
                                )}
                            </div>
                        </div>
                    </Section>

                    {!showPaymeFields && (
                        <div className="rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
                            Bu forma hozircha PAYME dual-mode flow uchun tayyorlangan.
                        </div>
                    )}

                    <Section title="Active mode" description="Checkout va callback qaysi credential bilan ishlashini shu yerdan tanlang.">
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
                                        <div className="flex items-start justify-between gap-3">
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

                    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                        <CredentialCard
                            mode="TEST"
                            isActive={activeMode === "TEST"}
                            merchantField="testMerchantId"
                            loginField="testLogin"
                            secretField="testSecretKey"
                            secretConfigured={setting?.testSecretConfigured ?? false}
                            formik={formik}
                            inputClassName={inputClassName}
                            isEdit={isEdit}
                        />
                        <CredentialCard
                            mode="PROD"
                            isActive={activeMode === "PROD"}
                            merchantField="prodMerchantId"
                            loginField="prodLogin"
                            secretField="prodSecretKey"
                            secretConfigured={setting?.prodSecretConfigured ?? false}
                            formik={formik}
                            inputClassName={inputClassName}
                            isEdit={isEdit}
                        />
                    </div>

                    <Section title="Qo'shimcha sozlamalar">
                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_auto]">
                            <div>
                                <Label htmlFor="priority">Priority</Label>
                                <input
                                    id="priority"
                                    name="priority"
                                    type="number"
                                    value={formik.values.priority}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    className={inputClassName}
                                />
                                {formik.touched.priority && formik.errors.priority && (
                                    <p className="mt-1.5 text-xs text-error-500">{formik.errors.priority}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 gap-3 rounded-2xl border border-gray-200 p-4 dark:border-gray-800">
                                <label className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        checked={formik.values.active}
                                        onChange={(event) => formik.setFieldValue("active", event.target.checked)}
                                        className="h-4 w-4 rounded border-gray-300 text-brand-500"
                                    />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">Faol</span>
                                </label>
                                <label className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        checked={formik.values.primaryConfig}
                                        onChange={(event) => formik.setFieldValue("primaryConfig", event.target.checked)}
                                        className="h-4 w-4 rounded border-gray-300 text-brand-500"
                                    />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">Asosiy konfiguratsiya</span>
                                </label>
                            </div>
                        </div>
                    </Section>

                    <div className="flex justify-end gap-3 border-t border-gray-200 pt-4 dark:border-gray-800">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Bekor qilish
                        </Button>
                        <Button type="submit" isPending={isPending} disabled={isPending}>
                            Saqlash
                        </Button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
