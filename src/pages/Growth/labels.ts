import {
    GrowthArea,
    GrowthTaskStatus,
    LearnerSegment,
    MarketingChannel,
    MarketingPostStatus,
    MarketingSegment,
    SchoolLeadStage,
} from "../../api/growth/growthApi.ts";

type BadgeColor = "primary" | "success" | "error" | "warning" | "info" | "light" | "dark";

export const AREA_LABELS: Record<GrowthArea, string> = {
    PRODUCT: "Mahsulot",
    MARKETING: "Marketing",
    SCHOOLS: "Maktablar",
    INVESTMENT: "Investitsiya",
};

export const TASK_STATUS_LABELS: Record<GrowthTaskStatus, string> = {
    TODO: "Navbatda",
    IN_PROGRESS: "Jarayonda",
    DONE: "Bajarildi",
    BLOCKED: "To'xtab qoldi",
};

export const TASK_STATUS_COLORS: Record<GrowthTaskStatus, BadgeColor> = {
    TODO: "light",
    IN_PROGRESS: "info",
    DONE: "success",
    BLOCKED: "error",
};

export const CHANNEL_LABELS: Record<MarketingChannel, string> = {
    TELEGRAM_CHANNEL: "Telegram kanal (avtomatik)",
    INSTAGRAM: "Instagram",
    TELEGRAM_AD_POST: "Telegram reklama posti",
    META_AD: "Meta reklama",
};

export const SEGMENT_LABELS: Record<MarketingSegment, string> = {
    GRADES_5_8: "5–8-sinf",
    GRADES_9_11: "9–11-sinf / DTM",
    ALL: "Hammasi",
};

export const LEARNER_SEGMENT_LABELS: Record<LearnerSegment, string> = {
    GRADES_5_8: "5–8-sinf",
    GRADES_9_11: "9–11-sinf / DTM",
};

export const POST_STATUS_LABELS: Record<MarketingPostStatus, string> = {
    DRAFT: "Qoralama",
    APPROVED: "Tasdiqlangan",
    PUBLISHED: "Chiqdi",
    FAILED: "Xato",
};

export const POST_STATUS_COLORS: Record<MarketingPostStatus, BadgeColor> = {
    DRAFT: "light",
    APPROVED: "info",
    PUBLISHED: "success",
    FAILED: "error",
};

export const STAGE_LABELS: Record<SchoolLeadStage, string> = {
    NEW: "Yangi",
    CONTACTED: "Murojaat qilindi",
    DEMO: "Demo",
    PILOT: "Pilot",
    LICENSE: "Litsenziya",
    LOST: "Rad etdi",
};

export const INPUT_CLASS =
    "h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";
export const TEXTAREA_CLASS =
    "w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";

export const formatSom = (value: number) =>
    `${Math.round(value).toLocaleString("ru-RU").replace(/[ \u00a0\u202f]/g, " ")} so'm`;

export const percent = (part: number, whole: number) =>
    whole > 0 ? `${Math.round((part / whole) * 100)}%` : "—";

/** Brauzerning mahalliy sanasi YYYY-MM-DD ko'rinishida. */
export const isoDate = (date: Date) => {
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

export const addDays = (date: Date, days: number) => {
    const copy = new Date(date);
    copy.setDate(copy.getDate() + days);
    return copy;
};

/** "2026-10-07T19:00:00" → "07.10 19:00" */
export const formatDateTime = (value?: string | null) => {
    if (!value) return "—";
    const parts = value.includes("T") ? value.split("T") : value.split(" ");
    const date = parts[0];
    const time = parts[1] || "";
    const dateParts = date.split("-");
    if (dateParts.length < 3) return value;
    const [, month, day] = dateParts;
    return `${day}.${month} ${time.slice(0, 5)}`;
};
