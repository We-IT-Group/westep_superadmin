import { AxiosError } from "axios";
import apiClient from "../apiClient";

export type ChatChannel = "APP" | "TELEGRAM";
export type SupportSenderType = "STUDENT" | "PARENT" | "ADMIN";

export interface StudentSummary {
  id: string;
  firstname: string;
  lastname: string;
  fullName: string;
  phone?: string;
  age?: string;
}

export interface SupportThread {
  id: string;
  channel: ChatChannel;
  title: string;
  phone?: string;
  studentId?: string;
  children: StudentSummary[];
  lastMessagePreview?: string;
  lastMessageAt?: string;
  adminUnreadCount: number;
  studentUnreadCount: number;
  createdAt: string;
}

export interface SupportMessage {
  id: string;
  threadId: string;
  senderType: SupportSenderType;
  senderName: string;
  senderUserId?: string;
  body: string;
  createdAt: string;
  deliveryFailed?: boolean;
}

export interface SupportThreadListResponse {
  page: number;
  size: number;
  total: number;
  totalAdminUnread: number;
  threads: SupportThread[];
}

export interface SupportMessageListResponse {
  page: number;
  size: number;
  total: number;
  messages: SupportMessage[];
}

export interface ThreadFilters {
  channel?: ChatChannel | "";
  unread?: boolean;
  search?: string;
  page?: number;
  size?: number;
}

function extractMessage(error: unknown, fallback: string) {
  const err = error as AxiosError<{ message?: string }>;
  return err.response?.data?.message || fallback;
}

export const getAdminThreads = async (
  filters: ThreadFilters
): Promise<SupportThreadListResponse> => {
  const { data } = await apiClient.get("/admin/chats", {
    params: {
      channel: filters.channel || undefined,
      unread: filters.unread ? true : undefined,
      search: filters.search?.trim() || undefined,
      page: filters.page ?? 0,
      size: filters.size ?? 30,
    },
  });
  return data;
};

export const getAdminThread = async (threadId: string): Promise<SupportThread> => {
  const { data } = await apiClient.get(`/admin/chats/${threadId}`);
  return data;
};

export const getAdminThreadMessages = async (
  threadId: string,
  page = 0,
  size = 100
): Promise<SupportMessageListResponse> => {
  const { data } = await apiClient.get(`/admin/chats/${threadId}/messages`, {
    params: { page, size },
  });
  return data;
};

export const sendAdminMessage = async (
  threadId: string,
  body: string
): Promise<SupportMessage> => {
  try {
    const { data } = await apiClient.post(`/admin/chats/${threadId}/messages`, {
      body,
    });
    return data;
  } catch (error) {
    throw new Error(extractMessage(error, "Xabar yuborishda xatolik yuz berdi"));
  }
};
