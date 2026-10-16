import {AxiosError} from "axios";
import apiClient from "../apiClient";

export type SignupMethod = "PHONE" | "GOOGLE" | "TELEGRAM";
export type SubscriptionFilter = "" | "ACTIVE" | "TRIAL" | "PAST_DUE" | "CANCELLED" | "EXPIRED" | "NONE";

export interface AdminStudentListItem {
    id: string;
    firstname: string;
    lastname: string;
    phone: string;
    displayPhone: string;
    signupMethod: SignupMethod | null;
    parentPhone: string | null;
    age: number | null;
    gender: "MALE" | "FEMALE" | null;
    subscriptionStatus: string;
    planName: string | null;
    trial: boolean;
    subscriptionEndsAt: string | null;
    platform: string | null;
    lastSeenAt: string | null;
    createdAt: string | null;
}

export interface AdminStudentListResponse {
    page: number;
    size: number;
    totalElements: number;
    items: AdminStudentListItem[];
}

export interface AdminStudentStatsResponse {
    total: number;
    phone: number;
    google: number;
    telegram: number;
    paying: number;
    newThisWeek: number;
}

export interface AdminStudentDevice {
    id: string;
    deviceName: string | null;
    platform: string | null;
    browser: string | null;
    lastSeenAt: string | null;
    active: boolean;
}

export interface AdminStudentPayment {
    id: string;
    amountSom: number;
    status: string;
    purpose: string | null;
    provider: string | null;
    createdAt: string | null;
}

export interface AdminStudentSubscription {
    id: string;
    planName: string | null;
    status: string;
    trial: boolean;
    autoRenew: boolean;
    currentPeriodStart: string | null;
    currentPeriodEnd: string | null;
}

export interface AdminStudentDetail {
    id: string;
    firstname: string;
    lastname: string;
    phone: string;
    displayPhone: string;
    signupMethod: SignupMethod | null;
    parentPhone: string | null;
    birthDate: string | null;
    age: number | null;
    gender: "MALE" | "FEMALE" | null;
    preferredLanguageCode: string | null;
    telegramUserId: number | null;
    telegramUsername: string | null;
    phoneVerified: boolean;
    createdAt: string | null;
    subscriptions: AdminStudentSubscription[];
    devices: AdminStudentDevice[];
    payments: AdminStudentPayment[];
}

export interface StudentListFilters {
    search?: string;
    signupMethod?: SignupMethod | "";
    subscriptionStatus?: SubscriptionFilter;
    page: number;
    size: number;
}

function extractMessage(error: unknown, fallback: string) {
    const err = error as AxiosError<{ message?: string }>;
    return err.response?.data?.message || fallback;
}

export async function getStudentStats(): Promise<AdminStudentStatsResponse> {
    try {
        const {data} = await apiClient.get<AdminStudentStatsResponse>("/admin/students/stats");
        return data;
    } catch (error) {
        throw new Error(extractMessage(error, "Statistika yuklanmadi"));
    }
}

export async function getStudents(filters: StudentListFilters): Promise<AdminStudentListResponse> {
    try {
        const {data} = await apiClient.get<AdminStudentListResponse>("/admin/students", {
            params: {
                search: filters.search?.trim() || undefined,
                signupMethod: filters.signupMethod || undefined,
                subscriptionStatus: filters.subscriptionStatus || undefined,
                page: filters.page,
                size: filters.size,
            },
        });
        return data;
    } catch (error) {
        throw new Error(extractMessage(error, "O'quvchilar yuklanmadi"));
    }
}

export async function getStudent(id: string): Promise<AdminStudentDetail> {
    try {
        const {data} = await apiClient.get<AdminStudentDetail>(`/admin/students/${id}`);
        return data;
    } catch (error) {
        throw new Error(extractMessage(error, "O'quvchi yuklanmadi"));
    }
}

export async function exportStudentsCsv(filters: Omit<StudentListFilters, "page" | "size">): Promise<Blob> {
    try {
        const {data} = await apiClient.get<Blob>("/admin/students/export.csv", {
            params: {
                search: filters.search?.trim() || undefined,
                signupMethod: filters.signupMethod || undefined,
                subscriptionStatus: filters.subscriptionStatus || undefined,
            },
            responseType: "blob",
        });
        return data;
    } catch (error) {
        throw new Error(extractMessage(error, "CSV yuklanmadi"));
    }
}
