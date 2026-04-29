import {useMemo} from "react";
import {useFormik} from "formik";
import * as Yup from "yup";
import {Modal} from "../ui/modal";
import Label from "../form/Label.tsx";
import Button from "../ui/button/Button.tsx";
import {PaymentSettings, PaymentSettingsFormValues, PaymentProvider} from "../../types/types.ts";

const providerOptions: PaymentProvider[] = ["PAYME", "CLICK", "UZUM", "STRIPE"];
const modeOptions = ["TEST", "PROD"] as const;

const createInitialValues = (setting?: PaymentSettings | null): PaymentSettingsFormValues => ({
    provider: setting?.provider || "PAYME",
    displayName: setting?.displayName || "",
    mode: setting?.mode || "TEST",
    merchantId: setting?.merchantId || "",
    login: setting?.login || "",
    secretKey: "",
    callbackUrl: setting?.callbackUrl || "",
    active: setting?.active ?? true,
    primaryConfig: setting?.primaryConfig ?? false,
    priority: setting?.priority ?? 0,
});

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
            mode: Yup.string().required("Rejim tanlanishi kerak"),
            merchantId: Yup.string().test("merchant-required", "Merchant ID kiritilishi kerak", function (value) {
                return this.parent.provider !== "PAYME" || Boolean(value?.trim());
            }),
            login: Yup.string().test("login-required", "Login kiritilishi kerak", function (value) {
                return this.parent.provider !== "PAYME" || Boolean(value?.trim());
            }),
            secretKey: Yup.string().test("secret-required", "Secret key kiritilishi kerak", function (value) {
                if (this.parent.provider !== "PAYME") return true;
                if (isEdit) return true;
                return Boolean(value?.trim());
            }),
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
            active: Yup.boolean().required(),
            primaryConfig: Yup.boolean().required(),
            priority: Yup.number().typeError("Ustuvorlik raqam bo'lishi kerak").required("Ustuvorlik kiritilishi kerak"),
        }),
        onSubmit: async (values, helpers) => {
            try {
                await onSubmit({
                    ...values,
                    displayName: values.displayName.trim(),
                    merchantId: values.merchantId.trim(),
                    login: values.login.trim(),
                    secretKey: values.secretKey.trim(),
                    callbackUrl: values.callbackUrl.trim(),
                    priority: Number(values.priority),
                });
                helpers.resetForm();
                onClose();
            } catch {
                // Error handling is done in parent toast.
            }
        },
    });

    const showPaymeFields = formik.values.provider === "PAYME";

    const inputClassName =
        "h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs focus:outline-hidden focus:ring-3 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-[760px] m-4 p-6 sm:p-8">
            <div className="space-y-6">
                <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Provider konfiguratsiyasini shu yerda boshqarasiz.
                    </p>
                </div>

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        formik.handleSubmit();
                    }}
                    className="space-y-5"
                >
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
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
                                placeholder="Payme Main"
                            />
                        </div>

                        <div>
                            <Label htmlFor="mode">Rejim</Label>
                            <select
                                id="mode"
                                name="mode"
                                value={formik.values.mode}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                className={inputClassName}
                            >
                                {modeOptions.map((option) => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </select>
                            {formik.touched.mode && formik.errors.mode && (
                                <p className="mt-1.5 text-xs text-error-500">{formik.errors.mode}</p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="priority">Ustuvorlik</Label>
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

                        <div>
                            <Label htmlFor="merchantId">Merchant ID</Label>
                            <input
                                id="merchantId"
                                name="merchantId"
                                value={formik.values.merchantId}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                className={inputClassName}
                                placeholder="Merchant ID"
                            />
                            {formik.touched.merchantId && formik.errors.merchantId && (
                                <p className="mt-1.5 text-xs text-error-500">{formik.errors.merchantId}</p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="login">Login</Label>
                            <input
                                id="login"
                                name="login"
                                value={formik.values.login}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                className={inputClassName}
                                placeholder="Login"
                            />
                            {formik.touched.login && formik.errors.login && (
                                <p className="mt-1.5 text-xs text-error-500">{formik.errors.login}</p>
                            )}
                        </div>

                        <div className="md:col-span-2">
                            <Label htmlFor="callbackUrl">Callback URL</Label>
                            <input
                                id="callbackUrl"
                                name="callbackUrl"
                                value={formik.values.callbackUrl}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                className={inputClassName}
                                placeholder="https://example.com/api/payme/callback"
                            />
                            {formik.touched.callbackUrl && formik.errors.callbackUrl && (
                                <p className="mt-1.5 text-xs text-error-500">{formik.errors.callbackUrl}</p>
                            )}
                        </div>

                        <div className="md:col-span-2">
                            <Label htmlFor="secretKey">Secret kalit</Label>
                            <input
                                id="secretKey"
                                name="secretKey"
                                type="password"
                                value={formik.values.secretKey}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                className={inputClassName}
                                placeholder={isEdit ? "Yangi secret kalit kiritilsa yangilanadi" : "Secret kalit"}
                            />
                            {isEdit && setting?.secretConfigured && (
                                <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                                    Secret kalit allaqachon sozlangan
                                </p>
                            )}
                            {formik.touched.secretKey && formik.errors.secretKey && (
                                <p className="mt-1.5 text-xs text-error-500">{formik.errors.secretKey}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 rounded-xl border border-gray-200 p-4 dark:border-gray-800 md:grid-cols-2">
                        <label className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                checked={formik.values.active}
                                onChange={(e) => formik.setFieldValue("active", e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 text-brand-500"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">Faol</span>
                        </label>
                        <label className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                checked={formik.values.primaryConfig}
                                onChange={(e) => formik.setFieldValue("primaryConfig", e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 text-brand-500"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">Asosiy konfiguratsiya</span>
                        </label>
                    </div>

                    {!showPaymeFields && (
                        <div className="rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
                            Bu UI PAYME fieldlarini to'liq validation bilan tayyorlagan. Qolgan providerlar keyingi bosqichda kengaytiriladi.
                        </div>
                    )}

                    <div className="flex justify-end gap-3">
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
