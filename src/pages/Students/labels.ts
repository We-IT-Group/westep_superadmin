import {SignupMethod} from "../../api/students/studentApi.ts";

export const SIGNUP_LABELS: Record<SignupMethod, string> = {
    PHONE: "Telefon",
    GOOGLE: "Google",
    TELEGRAM: "Telegram",
};

export const SIGNUP_TONES: Record<SignupMethod, string> = {
    PHONE: "bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-300",
    GOOGLE: "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300",
    TELEGRAM: "bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300",
};

export const SUB_LABELS: Record<string, string> = {
    NONE: "Obuna yo'q",
    TRIAL: "Sinov",
    ACTIVE: "To'lovchi",
    PAST_DUE: "Kechikkan",
    CANCELLED: "Bekor",
    EXPIRED: "Tugagan",
};

export const SUB_TONES: Record<string, string> = {
    NONE: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
    TRIAL: "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300",
    ACTIVE: "bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-300",
    PAST_DUE: "bg-warning-50 text-warning-700 dark:bg-warning-500/10 dark:text-warning-300",
    CANCELLED: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
    EXPIRED: "bg-error-50 text-error-700 dark:bg-error-500/10 dark:text-error-300",
};

export function formatDateTime(value?: string | null) {
    if (!value) return "—";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return parsed.toLocaleString("uz-UZ", {dateStyle: "medium", timeStyle: "short"});
}

export function formatRelative(value?: string | null) {
    if (!value) return "—";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    const diffMs = Date.now() - parsed.getTime();
    const minutes = Math.round(diffMs / 60000);
    if (minutes < 1) return "hozir";
    if (minutes < 60) return `${minutes} daq`;
    const hours = Math.round(minutes / 60);
    if (hours < 24) return `${hours} soat`;
    const days = Math.round(hours / 24);
    if (days < 7) return `${days} kun`;
    return formatDateTime(value);
}

export function genderLabel(gender?: string | null) {
    if (gender === "MALE") return "O'g'il";
    if (gender === "FEMALE") return "Qiz";
    return "—";
}

export function formatSom(amount?: number | null) {
    if (amount == null) return "—";
    return `${amount.toLocaleString("ru-RU")} so'm`;
}
