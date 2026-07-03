import {PaymentMode, PaymentSettings} from "../../types/types.ts";

export function SettingsBadge({
    label,
    tone = "gray",
}: {
    label: string;
    tone?: "blue" | "green" | "orange" | "gray" | "red";
}) {
    const toneClass = {
        blue: "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300",
        green: "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-300",
        orange: "bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-300",
        gray: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
        red: "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-300",
    }[tone];

    return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${toneClass}`}>{label}</span>;
}

export function formatValue(value?: string | number | null, fallback = "—") {
    if (value === null || value === undefined || value === "") return fallback;
    return String(value);
}

export function getModeTone(mode: PaymentMode) {
    return mode === "PROD" ? "green" : "orange";
}

export function getModeDescription(mode: PaymentMode) {
    return mode === "PROD" ? "Real to'lovlar shu kassa orqali o'tadi" : "Sandbox / test paymentlar uchun";
}

export function getSecretBadgeLabel(configured: boolean) {
    return configured ? "Secret configured" : "Secret not set";
}

export function getActiveCredentialWarning(setting: PaymentSettings) {
    if (setting.mode === "TEST") {
        return !setting.testMerchantId || !setting.testLogin
            ? "TEST rejim aktiv, test credentiallarni to'ldirish tavsiya qilinadi"
            : null;
    }

    return !setting.prodMerchantId || !setting.prodLogin
        ? "PROD rejim aktiv, prod credentiallarni to'ldirish tavsiya qilinadi"
        : null;
}
