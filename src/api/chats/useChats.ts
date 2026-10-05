import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAdminThread,
  getAdminThreadMessages,
  getAdminThreads,
  sendAdminMessage,
  ThreadFilters,
} from "./chatApi";

export const chatKeys = {
  all: ["admin-chats"] as const,
  threads: (filters: ThreadFilters) => [...chatKeys.all, "threads", filters] as const,
  thread: (id: string) => [...chatKeys.all, "thread", id] as const,
  messages: (threadId: string) => [...chatKeys.all, "messages", threadId] as const,
};

export const useAdminThreads = (filters: ThreadFilters) => {
  return useQuery({
    queryKey: chatKeys.threads(filters),
    queryFn: () => getAdminThreads(filters),
    refetchInterval: 4000, // 4 soniya polling
    staleTime: 3000,
  });
};

export const useAdminThread = (threadId: string | null) => {
  return useQuery({
    queryKey: chatKeys.thread(threadId ?? ""),
    queryFn: () => getAdminThread(threadId!),
    enabled: Boolean(threadId),
  });
};

export const useAdminThreadMessages = (threadId: string | null) => {
  return useQuery({
    queryKey: chatKeys.messages(threadId ?? ""),
    queryFn: () => getAdminThreadMessages(threadId!),
    enabled: Boolean(threadId),
    refetchInterval: 3000, // 3 soniya polling faol chat uchun
    staleTime: 2000,
  });
};

export const useSendAdminMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ threadId, body }: { threadId: string; body: string }) =>
      sendAdminMessage(threadId, body),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: chatKeys.messages(variables.threadId) });
      queryClient.invalidateQueries({ queryKey: chatKeys.all });
    },
  });
};
