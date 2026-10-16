import apiClient from "../apiClient";
import {AxiosError} from "axios";

export type GrowthArea = "PRODUCT" | "MARKETING" | "SCHOOLS" | "INVESTMENT";
export type GrowthTaskStatus = "TODO" | "IN_PROGRESS" | "DONE" | "BLOCKED";
export type MarketingChannel = "TELEGRAM_CHANNEL" | "INSTAGRAM" | "TELEGRAM_AD_POST" | "META_AD";
export type MarketingSegment = "GRADES_5_8" | "GRADES_9_11" | "ALL";
export type LearnerSegment = "GRADES_5_8" | "GRADES_9_11";
export type MarketingPostStatus = "DRAFT" | "APPROVED" | "PUBLISHED" | "FAILED";
export type SchoolLeadStage = "NEW" | "CONTACTED" | "DEMO" | "PILOT" | "LICENSE" | "LOST";

export interface GrowthTaskDto {
    id: string;
    week: number;
    area: GrowthArea;
    code?: string | null;
    title: string;
    description?: string | null;
    status: GrowthTaskStatus;
    dueDate?: string | null;
    note?: string | null;
    orderIndex: number;
}

export interface GrowthTaskPayload {
    week: number;
    area: GrowthArea;
    code?: string | null;
    title: string;
    description?: string | null;
    status: GrowthTaskStatus;
    dueDate?: string | null;
    note?: string | null;
    orderIndex?: number;
}

export interface MarketingPostDto {
    id: string;
    publishAt: string;
    channel: MarketingChannel;
    segment: MarketingSegment;
    kind: "MANUAL" | "DAILY_PROBLEM";
    title?: string | null;
    body: string;
    imageUrl?: string | null;
    promoCode?: string | null;
    status: MarketingPostStatus;
    publishedAt?: string | null;
    externalMessageId?: string | null;
    errorMessage?: string | null;
}

export interface MarketingPostPayload {
    publishAt: string;
    channel: MarketingChannel;
    segment: MarketingSegment;
    title?: string | null;
    body: string;
    imageUrl?: string | null;
    promoCode?: string | null;
}

export interface SchoolLeadDto {
    id: string;
    name: string;
    city?: string | null;
    contactName?: string | null;
    contactPhone?: string | null;
    stage: SchoolLeadStage;
    studentCount?: number | null;
    monthlyFee?: number | null;
    nextActionDate?: string | null;
    note?: string | null;
    updatedAt?: string | null;
}

export type SchoolLeadPayload = Omit<SchoolLeadDto, "id" | "updatedAt">;

export interface GrowthFunnelDto {
    from: string;
    to: string;
    segment: LearnerSegment | null;
    registrations: number;
    diagnostics: number;
    returned7d: number;
    trials: number;
    payingFamilies: number;
    revenueSom: number;
}

export interface GrowthSourceStatDto {
    source: string;
    registrations: number;
    payingFamilies: number;
    revenueSom: number;
}

export interface GrowthSummaryDto {
    planStart: string;
    currentWeek: number;
    totals: GrowthFunnelDto;
    minFamilies: number;
    goalFamilies: number;
    minRevenueSom: number;
    goalRevenueSom: number;
    weeks: GrowthFunnelDto[];
    bySegment: GrowthFunnelDto[];
    bySource: GrowthSourceStatDto[];
}

function extractMessage(error: unknown, fallback: string) {
    const err = error as AxiosError<{ message?: string }>;
    return err.response?.data?.message || fallback;
}

async function call<T>(fn: () => Promise<{ data: T }>, fallback: string): Promise<T> {
    try {
        return (await fn()).data;
    } catch (error) {
        throw new Error(extractMessage(error, fallback));
    }
}

export const getGrowthTasks = () =>
    call(() => apiClient.get<GrowthTaskDto[]>("/admin/growth/tasks"), "Vazifalar yuklanmadi");

export const saveGrowthTask = (id: string | null, body: GrowthTaskPayload) =>
    call(() => id
        ? apiClient.put<GrowthTaskDto>(`/admin/growth/tasks/${id}`, body)
        : apiClient.post<GrowthTaskDto>("/admin/growth/tasks", body), "Vazifa saqlanmadi");

export const setGrowthTaskStatus = (id: string, status: GrowthTaskStatus) =>
    call(() => apiClient.patch<GrowthTaskDto>(`/admin/growth/tasks/${id}/status`, {status}), "Holat o'zgarmadi");

export const deleteGrowthTask = (id: string) =>
    call(() => apiClient.delete<void>(`/admin/growth/tasks/${id}`), "Vazifa o'chirilmadi");

export const getMarketingPosts = (from: string, to: string) =>
    call(() => apiClient.get<MarketingPostDto[]>("/admin/growth/posts", {params: {from, to}}), "Postlar yuklanmadi");

export const saveMarketingPost = (id: string | null, body: MarketingPostPayload) =>
    call(() => id
        ? apiClient.put<MarketingPostDto>(`/admin/growth/posts/${id}`, body)
        : apiClient.post<MarketingPostDto>("/admin/growth/posts", body), "Post saqlanmadi");

export const approveMarketingPost = (id: string) =>
    call(() => apiClient.post<MarketingPostDto>(`/admin/growth/posts/${id}/approve`), "Post tasdiqlanmadi");

export const unapproveMarketingPost = (id: string) =>
    call(() => apiClient.post<MarketingPostDto>(`/admin/growth/posts/${id}/unapprove`), "Tasdiq bekor qilinmadi");

export const deleteMarketingPost = (id: string) =>
    call(() => apiClient.delete<void>(`/admin/growth/posts/${id}`), "Post o'chirilmadi");

export const getSchoolLeads = () =>
    call(() => apiClient.get<SchoolLeadDto[]>("/admin/growth/schools"), "Maktablar yuklanmadi");

export const saveSchoolLead = (id: string | null, body: SchoolLeadPayload) =>
    call(() => id
        ? apiClient.put<SchoolLeadDto>(`/admin/growth/schools/${id}`, body)
        : apiClient.post<SchoolLeadDto>("/admin/growth/schools", body), "Maktab saqlanmadi");

export const deleteSchoolLead = (id: string) =>
    call(() => apiClient.delete<void>(`/admin/growth/schools/${id}`), "Maktab o'chirilmadi");

export const getGrowthSummary = () =>
    call(() => apiClient.get<GrowthSummaryDto>("/admin/growth/metrics/summary"), "Ko'rsatkichlar yuklanmadi");

export const sendGrowthBrief = () =>
    call(() => apiClient.post<{ text: string }>("/admin/growth/brief/send"), "Hisobot yuborilmadi");
