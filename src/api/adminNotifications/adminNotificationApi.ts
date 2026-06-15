import {AxiosError} from "axios";
import apiClient from "../apiClient";
import {
    NotificationRecipientListResponse,
    ScheduledNotification,
    ScheduledNotificationListResponse,
    ScheduledNotificationStatus
} from "../../types/types.ts";

interface RecipientFilters {
    search: string;
    page: number;
    size: number;
}

interface ScheduledNotificationFilters {
    status?: ScheduledNotificationStatus | "";
    page: number;
    size: number;
}

export interface CreateScheduledNotificationRequest {
    title: string;
    body: string;
    scheduledAt: string;
    timezone: string;
    recipientUserIds: string[];
}

function extractMessage(error: unknown, fallback: string) {
    const err = error as AxiosError<{ message?: string }>;
    return err.response?.data?.message || fallback;
}

export const getStudentRecipients = async (
    filters: RecipientFilters,
): Promise<NotificationRecipientListResponse> => {
    const {data} = await apiClient.get("/admin/notifications/recipients/students", {
        params: {
            search: filters.search.trim() || undefined,
            page: filters.page,
            size: filters.size,
        },
    });
    return data;
};

export const createScheduledNotification = async (
    body: CreateScheduledNotificationRequest,
): Promise<ScheduledNotification> => {
    try {
        const {data} = await apiClient.post("/admin/notifications/scheduled", body);
        return data;
    } catch (error) {
        throw new Error(extractMessage(error, "Notification rejalashtirilmadi"));
    }
};

export const getScheduledNotifications = async (
    filters: ScheduledNotificationFilters,
): Promise<ScheduledNotificationListResponse> => {
    const {data} = await apiClient.get("/admin/notifications/scheduled", {
        params: {
            status: filters.status || undefined,
            page: filters.page,
            size: filters.size,
        },
    });
    return data;
};

export const cancelScheduledNotification = async (id: string): Promise<ScheduledNotification> => {
    try {
        const {data} = await apiClient.patch(`/admin/notifications/scheduled/${id}/cancel`);
        return data;
    } catch (error) {
        throw new Error(extractMessage(error, "Notification bekor qilinmadi"));
    }
};
