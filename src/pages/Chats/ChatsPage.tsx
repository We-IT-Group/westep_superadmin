import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";
import {
  ChatChannel,
  StudentSummary,
  SupportMessage,
  SupportThread,
} from "../../api/chats/chatApi";
import {
  useAdminThread,
  useAdminThreadMessages,
  useAdminThreads,
  useSendAdminMessage,
} from "../../api/chats/useChats";
import StatusToast from "../../components/paymentSettings/StatusToast";

type FilterTab = "ALL" | "APP" | "TELEGRAM" | "UNREAD";

function getInitials(name: string): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatThreadTime(isoString?: string): string {
  if (!isoString) return "";
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return "";
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    if (isToday) {
      return d.toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit", hour12: false });
    }
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) {
      return "Kecha";
    }
    return d.toLocaleDateString("uz-UZ", { day: "2-digit", month: "2-digit" });
  } catch {
    return "";
  }
}

function formatMessageTime(isoString?: string): string {
  if (!isoString) return "";
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit", hour12: false });
  } catch {
    return "";
  }
}

function formatMessageDateHeader(isoString?: string): string {
  if (!isoString) return "Suhbat";
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return "Suhbat";
    const now = new Date();
    if (d.toDateString() === now.toDateString()) return "Bugun";
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return "Kecha";
    return d.toLocaleDateString("uz-UZ", { day: "numeric", month: "long" });
  } catch {
    return "Suhbat";
  }
}

export default function ChatsPage() {
  const [activeTab, setActiveTab] = useState<FilterTab>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [messageDraft, setMessageDraft] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Search debounce
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Construct filters
  const threadFilters = useMemo(() => {
    const channelParam: ChatChannel | "" =
      activeTab === "APP" ? "APP" : activeTab === "TELEGRAM" ? "TELEGRAM" : "";
    const unreadParam = activeTab === "UNREAD" ? true : undefined;
    return {
      channel: channelParam,
      unread: unreadParam,
      search: debouncedSearch,
      page: 0,
      size: 50,
    };
  }, [activeTab, debouncedSearch]);

  const { data: threadListData, isLoading: threadsLoading } = useAdminThreads(threadFilters);
  const { data: activeThreadData } = useAdminThread(selectedThreadId);
  const { data: messagesData, isLoading: messagesLoading } =
    useAdminThreadMessages(selectedThreadId);
  const sendMessageMutation = useSendAdminMessage();

  const threads = threadListData?.threads ?? [];
  const totalAdminUnread = threadListData?.totalAdminUnread ?? 0;

  // Selected thread fallback to list item
  const selectedThread: SupportThread | null =
    activeThreadData ||
    threads.find((t) => t.id === selectedThreadId) ||
    null;

  // Messages autoscroll
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    if (messagesData?.messages) {
      scrollToBottom("auto");
    }
  }, [messagesData?.messages, selectedThreadId]);

  // Handle message sending
  const handleSendMessage = async () => {
    if (!selectedThreadId || !messageDraft.trim() || sendMessageMutation.isPending) {
      return;
    }

    const textToSend = messageDraft.trim();
    setMessageDraft("");

    try {
      const result = await sendMessageMutation.mutateAsync({
        threadId: selectedThreadId,
        body: textToSend,
      });

      if (result.deliveryFailed) {
        setToast({
          message: "Xabar tizimda saqlandi, lekin Telegram bot orqali yetkazib bo'lmadi.",
          type: "error",
        });
      }
      setTimeout(() => scrollToBottom("smooth"), 100);
    } catch (err: unknown) {
      const error = err as Error;
      setToast({
        message: error.message || "Xabar yuborishda xatolik yuz berdi",
        type: "error",
      });
      setMessageDraft(textToSend); // Restore draft on error
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Group messages by date
  const groupedMessages = useMemo(() => {
    const list = messagesData?.messages ?? [];
    const groups: { dateHeader: string; messages: SupportMessage[] }[] = [];
    let currentHeader = "";
    let currentGroup: SupportMessage[] = [];

    for (const msg of list) {
      const header = formatMessageDateHeader(msg.createdAt);
      if (header !== currentHeader) {
        if (currentGroup.length > 0) {
          groups.push({ dateHeader: currentHeader, messages: currentGroup });
        }
        currentHeader = header;
        currentGroup = [msg];
      } else {
        currentGroup.push(msg);
      }
    }
    if (currentGroup.length > 0) {
      groups.push({ dateHeader: currentHeader, messages: currentGroup });
    }
    return groups;
  }, [messagesData?.messages]);

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Chatlar
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            O'quvchi mobil ilovasi va ota-ona Telegram boti orqali kelgan murojaatlar
          </p>
        </div>
        {totalAdminUnread > 0 && (
          <div className="flex items-center gap-2 self-start rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-600 dark:bg-brand-950/40 dark:text-brand-400">
            <span className="size-2 rounded-full bg-brand-500 animate-pulse" />
            {totalAdminUnread} ta yangi o'qilmagan xabar
          </div>
        )}
      </div>

      {/* Main Inbox Box */}
      <div className="flex h-[calc(100vh-210px)] min-h-[580px] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs dark:border-gray-800 dark:bg-gray-900">
        {/* ============================================================== */}
        {/* LEFT COLUMN: Threads List */}
        {/* ============================================================== */}
        <div
          className={`flex w-full flex-col border-r border-gray-200 bg-gray-50/50 dark:border-gray-800 dark:bg-gray-900/60 md:w-80 lg:w-96 ${
            selectedThreadId ? "hidden md:flex" : "flex"
          }`}
        >
          {/* Search Header */}
          <div className="p-3 border-b border-gray-200/80 dark:border-gray-800">
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 1114 0z" />
                </svg>
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Qidiruv (ism, telefon)..."
                aria-label="Suhbatlarni qidirish"
                className="w-full rounded-xl border border-gray-200 bg-white py-2 pr-8 pl-9 text-xs text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  aria-label="Qidiruvni tozalash"
                >
                  <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="mt-2.5 flex items-center gap-1 rounded-xl bg-gray-200/60 p-1 text-xs dark:bg-gray-800/80">
              <button
                type="button"
                onClick={() => setActiveTab("ALL")}
                className={`flex-1 rounded-lg py-1.5 font-medium transition-colors ${
                  activeTab === "ALL"
                    ? "bg-white text-gray-900 shadow-2xs dark:bg-gray-700 dark:text-white"
                    : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                }`}
              >
                Hammasi
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("APP")}
                className={`flex-1 rounded-lg py-1.5 font-medium transition-colors ${
                  activeTab === "APP"
                    ? "bg-white text-emerald-600 shadow-2xs dark:bg-gray-700 dark:text-emerald-400"
                    : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                }`}
              >
                App
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("TELEGRAM")}
                className={`flex-1 rounded-lg py-1.5 font-medium transition-colors ${
                  activeTab === "TELEGRAM"
                    ? "bg-white text-sky-600 shadow-2xs dark:bg-gray-700 dark:text-sky-400"
                    : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                }`}
              >
                Telegram
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("UNREAD")}
                className={`relative flex-1 rounded-lg py-1.5 font-medium transition-colors ${
                  activeTab === "UNREAD"
                    ? "bg-white text-brand-600 shadow-2xs dark:bg-gray-700 dark:text-brand-400"
                    : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                }`}
              >
                O'qilmagan
                {totalAdminUnread > 0 && (
                  <span className="ml-1 inline-flex size-4 items-center justify-center rounded-full bg-brand-500 text-[10px] font-bold text-white">
                    {totalAdminUnread > 9 ? "9+" : totalAdminUnread}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Threads List Items */}
          <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800/60">
            {threadsLoading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-3 animate-pulse">
                    <div className="size-11 rounded-full bg-gray-200 dark:bg-gray-800" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3.5 w-28 rounded bg-gray-200 dark:bg-gray-800" />
                      <div className="h-3 w-40 rounded bg-gray-100 dark:bg-gray-800/60" />
                    </div>
                  </div>
                ))}
              </div>
            ) : threads.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                <div className="mb-2 flex size-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400">
                  <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Suhbatlar topilmadi
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  {debouncedSearch
                    ? "Qidiruv so'rovi bo'yicha hech narsa yo'q"
                    : "Hozircha xabarlar mavjud emas"}
                </p>
              </div>
            ) : (
              threads.map((item) => {
                const isSelected = item.id === selectedThreadId;
                const hasUnread = item.adminUnreadCount > 0;
                const isApp = item.channel === "APP";

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedThreadId(item.id)}
                    className={`w-full text-left p-3.5 flex items-start gap-3 transition-colors ${
                      isSelected
                        ? "bg-brand-50/70 dark:bg-brand-950/30 border-l-4 border-l-brand-500"
                        : "hover:bg-gray-100/70 dark:hover:bg-gray-800/40"
                    }`}
                  >
                    {/* Avatar */}
                    <div
                      className={`relative flex size-11 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        isApp
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300"
                          : "bg-sky-100 text-sky-700 dark:bg-sky-950/80 dark:text-sky-300"
                      }`}
                    >
                      {getInitials(item.title)}
                      {/* Channel indicator icon */}
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full border border-white text-[9px] text-white dark:border-gray-900 ${
                          isApp ? "bg-emerald-500" : "bg-sky-500"
                        }`}
                        title={isApp ? "App kanali" : "Telegram boti"}
                      >
                        {isApp ? "A" : "TG"}
                      </span>
                    </div>

                    {/* Thread Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span
                          className={`truncate text-sm font-semibold ${
                            hasUnread
                              ? "text-gray-950 dark:text-white"
                              : "text-gray-800 dark:text-gray-200"
                          }`}
                        >
                          {item.title}
                        </span>
                        <span className="shrink-0 text-[11px] text-gray-400 dark:text-gray-500">
                          {formatThreadTime(item.lastMessageAt || item.createdAt)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <p
                          className={`truncate text-xs ${
                            hasUnread
                              ? "font-medium text-gray-900 dark:text-gray-100"
                              : "text-gray-500 dark:text-gray-400"
                          }`}
                        >
                          {item.lastMessagePreview || "Yangi suhbat"}
                        </p>
                        {hasUnread && (
                          <span className="shrink-0 inline-flex min-w-[20px] items-center justify-center rounded-full bg-brand-500 px-1.5 py-0.5 text-[10px] font-bold text-white shadow-2xs">
                            {item.adminUnreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ============================================================== */}
        {/* RIGHT COLUMN: Active Chat Pane */}
        {/* ============================================================== */}
        <div
          className={`flex-1 flex flex-col bg-white dark:bg-gray-900 ${
            !selectedThreadId ? "hidden md:flex" : "flex"
          }`}
        >
          {selectedThread ? (
            <>
              {/* Chat Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200/80 px-4 py-3 dark:border-gray-800 sm:px-6">
                <div className="flex items-center gap-3">
                  {/* Mobile Back Button */}
                  <button
                    type="button"
                    onClick={() => setSelectedThreadId(null)}
                    className="flex size-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 md:hidden"
                    aria-label="Suhbatlar ro'yxatiga qaytish"
                  >
                    <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  {/* Header Avatar */}
                  <div
                    className={`flex size-10 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      selectedThread.channel === "APP"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                        : "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300"
                    }`}
                  >
                    {getInitials(selectedThread.title)}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-bold text-gray-900 dark:text-white">
                        {selectedThread.title}
                      </h2>
                      {/* Channel Badge */}
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium ${
                          selectedThread.channel === "APP"
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60"
                            : "bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-400 border border-sky-200/60 dark:border-sky-800/60"
                        }`}
                      >
                        {selectedThread.channel === "APP" ? "Mobil ilova" : "Telegram boti"}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      {selectedThread.phone && (
                        <span>📞 {selectedThread.phone}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Header Actions */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Child chips for Telegram thread */}
                  {selectedThread.children && selectedThread.children.length > 0 && (
                    <div className="hidden lg:flex items-center gap-1.5">
                      <span className="text-xs text-gray-400">Farzandlar:</span>
                      {selectedThread.children.map((child: StudentSummary) => (
                        <Link
                          key={child.id}
                          to={`/students/${child.id}`}
                          className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700 hover:bg-brand-50 hover:text-brand-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-brand-950 dark:hover:text-brand-400 transition-colors"
                        >
                          {child.firstname}
                          {child.age ? ` (${child.age})` : ""}
                          <span className="text-gray-400">↗</span>
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* CRM Link button */}
                  {selectedThread.studentId && (
                    <Link
                      to={`/students/${selectedThread.studentId}`}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-brand-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700/80 transition-colors"
                    >
                      <span>O'quvchini ochish</span>
                      <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </Link>
                  )}
                </div>
              </div>

              {/* Multiple children mobile bar */}
              {selectedThread.children && selectedThread.children.length > 0 && (
                <div className="flex lg:hidden items-center gap-1.5 overflow-x-auto border-b border-gray-100 px-4 py-2 text-xs bg-gray-50/70 dark:border-gray-800 dark:bg-gray-800/40">
                  <span className="text-gray-400 shrink-0">Farzandlar:</span>
                  {selectedThread.children.map((child: StudentSummary) => (
                    <Link
                      key={child.id}
                      to={`/students/${child.id}`}
                      className="shrink-0 inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-0.5 text-xs font-medium text-gray-700 shadow-2xs dark:bg-gray-800 dark:text-gray-300"
                    >
                      {child.firstname}
                      {child.age ? ` (${child.age})` : ""}
                      <span className="text-gray-400">↗</span>
                    </Link>
                  ))}
                </div>
              )}

              {/* Messages Body */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-gray-50/30 dark:bg-gray-950/20">
                {messagesLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"} animate-pulse`}
                      >
                        <div
                          className={`h-12 w-48 rounded-2xl ${
                            i % 2 === 0 ? "bg-brand-100 dark:bg-brand-950" : "bg-gray-200 dark:bg-gray-800"
                          }`}
                        />
                      </div>
                    ))}
                  </div>
                ) : groupedMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
                    <p className="text-sm">Ushbu suhbatda hali xabarlar yo'q</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Pastdagi maydondan xabar yozib muloqotni boshlang.
                    </p>
                  </div>
                ) : (
                  groupedMessages.map((group) => (
                    <div key={group.dateHeader} className="space-y-3">
                      {/* Date Badge */}
                      <div className="flex justify-center">
                        <span className="rounded-full bg-gray-200/80 px-3 py-1 text-[11px] font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                          {group.dateHeader}
                        </span>
                      </div>

                      {/* Messages in Group */}
                      {group.messages.map((msg) => {
                        const isAdmin = msg.senderType === "ADMIN";

                        return (
                          <div
                            key={msg.id}
                            className={`flex flex-col ${isAdmin ? "items-end" : "items-start"}`}
                          >
                            <div
                              className={`relative max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-2.5 text-sm shadow-2xs ${
                                isAdmin
                                  ? "rounded-tr-xs bg-brand-500 text-white"
                                  : "rounded-tl-xs border border-gray-200 bg-white text-gray-900 dark:border-gray-700/80 dark:bg-gray-800 dark:text-white"
                              }`}
                            >
                              {/* Sender name for parent/student */}
                              {!isAdmin && (
                                <p className="mb-0.5 text-[11px] font-bold text-brand-600 dark:text-brand-400">
                                  {msg.senderName}
                                </p>
                              )}

                              {/* Message Body */}
                              <p className="whitespace-pre-wrap break-words leading-relaxed text-sm">
                                {msg.body}
                              </p>

                              {/* Timestamp and delivery status */}
                              <div
                                className={`mt-1 flex items-center justify-end gap-1.5 text-[10px] ${
                                  isAdmin ? "text-brand-100" : "text-gray-400 dark:text-gray-500"
                                }`}
                              >
                                <span>{formatMessageTime(msg.createdAt)}</span>
                                {isAdmin && (
                                  <svg className="size-3 text-brand-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </div>
                            </div>

                            {/* Delivery failure notice */}
                            {msg.deliveryFailed && (
                              <p className="mt-1 flex items-center gap-1 text-[11px] text-error-600 dark:text-error-400">
                                <span className="font-bold">⚠️</span> Telegram botga yetkazilmadi (saqlangan)
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Composer Footer */}
              <div className="border-t border-gray-200/80 bg-white p-3 dark:border-gray-800 dark:bg-gray-900 sm:p-4">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-end gap-2"
                >
                  <div className="relative flex-1">
                    <label htmlFor="chat-message-input" className="sr-only">
                      Xabar matni
                    </label>
                    <textarea
                      id="chat-message-input"
                      value={messageDraft}
                      onChange={(e) => setMessageDraft(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Xabar yozing... (Yuborish uchun Enter, yangi qator: Shift+Enter)"
                      rows={2}
                      maxLength={4000}
                      className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50/70 p-3 text-sm text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
                    />
                    {messageDraft.length > 3000 && (
                      <span className="absolute bottom-2 right-3 text-[10px] text-gray-400">
                        {messageDraft.length} / 4000
                      </span>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={!messageDraft.trim() || sendMessageMutation.isPending}
                    aria-label="Xabarni yuborish"
                    className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-brand-500 px-4 text-sm font-semibold text-white shadow-xs hover:bg-brand-600 focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40 transition-colors"
                  >
                    {sendMessageMutation.isPending ? (
                      <div className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <>
                        <span className="hidden sm:inline">Yuborish</span>
                        <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </>
          ) : (
            /* Empty State: No Thread Selected */
            <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
              <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-500 dark:bg-brand-950/40 dark:text-brand-400">
                <svg className="size-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Suhbatni tanlang
              </h2>
              <p className="mt-1 max-w-sm text-sm text-gray-500 dark:text-gray-400">
                Murojaatni ko'rish, xabarlar tarixini o'qish va javob yuborish uchun chapdagi ro'yxatdan suhbatni tanlang.
              </p>
            </div>
          )}
        </div>
      </div>

      {toast && (
        <StatusToast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
