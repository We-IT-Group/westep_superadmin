import {useMemo, useState} from "react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import ComponentCard from "../../components/common/ComponentCard";
import Button from "../../components/ui/button/Button.tsx";
import Badge from "../../components/ui/badge/Badge";
import {Modal} from "../../components/ui/modal";
import StatusToast from "../../components/paymentSettings/StatusToast.tsx";
import {MarketingChannel, MarketingPostDto, MarketingSegment} from "../../api/growth/growthApi.ts";
import {
    useApproveMarketingPost,
    useDeleteMarketingPost,
    useMarketingPosts,
    useSaveMarketingPost,
    useUnapproveMarketingPost,
} from "../../api/growth/useGrowth.ts";
import {
    addDays,
    CHANNEL_LABELS,
    formatDateTime,
    INPUT_CLASS,
    isoDate,
    POST_STATUS_COLORS,
    POST_STATUS_LABELS,
    SEGMENT_LABELS,
    TEXTAREA_CLASS,
} from "./labels.ts";

const MAX_BODY = 4000;

interface PostDraft {
    id: string | null;
    publishAt: string;
    channel: MarketingChannel;
    segment: MarketingSegment;
    title: string;
    body: string;
    imageUrl: string;
    promoCode: string;
}

const emptyDraft = (): PostDraft => ({
    id: null,
    publishAt: `${isoDate(new Date())}T19:00`,
    channel: "TELEGRAM_CHANNEL",
    segment: "ALL",
    title: "",
    body: "",
    imageUrl: "",
    promoCode: "",
});

const toDraft = (post: MarketingPostDto): PostDraft => ({
    id: post.id,
    publishAt: post.publishAt.slice(0, 16),
    channel: post.channel,
    segment: post.segment,
    title: post.title || "",
    body: post.body,
    imageUrl: post.imageUrl || "",
    promoCode: post.promoCode || "",
});

export default function MarketingPage() {
    const todayStr = useMemo(() => isoDate(new Date()), []);
    const [from, setFrom] = useState(todayStr);
    const [to, setTo] = useState(isoDate(addDays(new Date(), 13)));

    const {data: posts = [], isPending} = useMarketingPosts(from, to);
    const savePost = useSaveMarketingPost();
    const approve = useApproveMarketingPost();
    const unapprove = useUnapproveMarketingPost();
    const deletePost = useDeleteMarketingPost();

    const [draft, setDraft] = useState<PostDraft | null>(null);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

    const notify = (message: string, type: "success" | "error") => setToast({message, type});

    const run = async (action: () => Promise<unknown>, success: string) => {
        try {
            await action();
            notify(success, "success");
        } catch (e) {
            notify((e as Error).message, "error");
        }
    };

    const handleSave = async (shouldApproveAfterSave: boolean = false) => {
        if (!draft) return;
        if (!draft.body.trim() || !draft.publishAt) {
            notify("Chiqish vaqti va post matni kiritilishi shart", "error");
            return;
        }
        if (draft.body.length > MAX_BODY) {
            notify(`Post matni ${MAX_BODY} belgidan oshmasligi kerak (hozir ${draft.body.length})`, "error");
            return;
        }

        try {
            const saved = await savePost.mutateAsync({
                id: draft.id,
                body: {
                    publishAt: draft.publishAt,
                    channel: draft.channel,
                    segment: draft.segment,
                    title: draft.title.trim() || null,
                    body: draft.body.trim(),
                    imageUrl: draft.imageUrl.trim() || null,
                    promoCode: draft.promoCode.trim() || null,
                },
            });

            if (shouldApproveAfterSave && saved?.id) {
                await approve.mutateAsync(saved.id);
                notify("Post saqlandi va darhol tasdiqlandi", "success");
            } else {
                notify(draft.id ? "Post saqlandi" : "Yangi post qoralama sifatida saqlandi", "success");
            }
            setDraft(null);
        } catch (e) {
            notify((e as Error).message, "error");
        }
    };

    // Postlarni kunlar bo'yicha guruhlash (kunlik marketing ro'yxati)
    const groupedPosts = useMemo(() => {
        const groups: Record<string, MarketingPostDto[]> = {};
        const sorted = [...posts].sort((a, b) => a.publishAt.localeCompare(b.publishAt));

        for (const p of sorted) {
            const dateKey = p.publishAt.slice(0, 10);
            if (!groups[dateKey]) groups[dateKey] = [];
            groups[dateKey].push(p);
        }

        return Object.entries(groups).map(([date, items]) => ({
            date,
            items,
            isToday: date === todayStr,
            isPast: date < todayStr,
        }));
    }, [posts, todayStr]);

    return (
        <>
            {toast && <StatusToast message={toast.message} type={toast.type} onClose={() => setToast(null)}/>}
            <PageMeta title="Kunlik marketing — Boshqaruv markazi" description="Kontent kalendari"/>
            <PageBreadcrumb pageTitle="Kunlik marketing — Kontent kalendari"/>

            <div className="space-y-6">
                <ComponentCard
                    title="Kunlik kontent kalendari"
                    desc="Vaqtlar Toshkent bo'yicha. 'Telegram kanal' postlari tasdiqlangach, vaqti kelganda avtomatik chiqadi; boshqa kanallar — qo'lda joylash uchun reja."
                >
                    {/* Sana oralig'i va Yangi post qo'shish */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
                        <div className="flex flex-wrap items-center gap-2">
                            <label htmlFor="from-date" className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                Oraliq:
                            </label>
                            <input
                                id="from-date"
                                type="date"
                                value={from}
                                onChange={(e) => setFrom(e.target.value)}
                                className={`${INPUT_CLASS} max-w-[160px]`}
                            />
                            <span className="text-gray-400">—</span>
                            <label htmlFor="to-date" className="sr-only">
                                Gacha sana
                            </label>
                            <input
                                id="to-date"
                                type="date"
                                value={to}
                                onChange={(e) => setTo(e.target.value)}
                                className={`${INPUT_CLASS} max-w-[160px]`}
                            />
                        </div>

                        <Button size="sm" onClick={() => setDraft(emptyDraft())} className="min-h-[44px]">
                            + Yangi post yaratish
                        </Button>
                    </div>

                    {/* Kunlar bo'yicha guruhlangan postlar ro'yxati */}
                    <div className="mt-6 space-y-6">
                        {groupedPosts.map(({date, items, isToday}) => (
                            <div
                                key={date}
                                className={`rounded-xl border transition ${
                                    isToday
                                        ? "border-brand-300 bg-brand-50/20 dark:border-brand-500/30 dark:bg-brand-500/5"
                                        : "border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.02]"
                                } p-4`}
                            >
                                <div className="flex items-center justify-between border-b border-gray-100 pb-2.5 dark:border-gray-800">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold text-sm text-gray-900 dark:text-white">
                                            {date} {isToday ? "· Bugun" : ""}
                                        </h3>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                            ({items.length} ta post)
                                        </span>
                                    </div>
                                    <span className="text-xs font-medium text-gray-400">
                                        {new Date(date).toLocaleDateString("uz-UZ", {weekday: "long"})}
                                    </span>
                                </div>

                                <div className="mt-3 divide-y divide-gray-100 dark:divide-gray-800">
                                    {items.map((post) => {
                                        const isPublished = post.status === "PUBLISHED";
                                        const isApproved = post.status === "APPROVED";
                                        const isFailed = post.status === "FAILED";

                                        return (
                                            <div
                                                key={post.id}
                                                className="py-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"
                                            >
                                                <div className="min-w-0 max-w-2xl">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span className="font-semibold text-xs text-brand-600 dark:text-brand-400">
                                                            {formatDateTime(post.publishAt)}
                                                        </span>
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                                                            {CHANNEL_LABELS[post.channel]}
                                                        </span>
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
                                                            {SEGMENT_LABELS[post.segment]}
                                                        </span>
                                                        <Badge size="sm" color={POST_STATUS_COLORS[post.status]}>
                                                            {POST_STATUS_LABELS[post.status]}
                                                        </Badge>
                                                    </div>

                                                    <h4 className="mt-1.5 text-sm font-medium text-gray-900 dark:text-white">
                                                        {post.title || post.body.slice(0, 60)}
                                                    </h4>

                                                    <p className="mt-1 text-xs text-gray-500 line-clamp-2 dark:text-gray-400 whitespace-pre-line">
                                                        {post.body}
                                                    </p>

                                                    {post.promoCode && (
                                                        <div className="mt-1 text-xs font-semibold text-brand-600">
                                                            Promo-kod: {post.promoCode}
                                                        </div>
                                                    )}

                                                    {isFailed && post.errorMessage && (
                                                        <div className="mt-2 rounded-md bg-error-50 p-2 text-xs font-medium text-error-700 dark:bg-error-500/10 dark:text-error-300">
                                                            Xatolik sababi: {post.errorMessage}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex flex-wrap items-center gap-2 shrink-0">
                                                    {isPublished ? (
                                                        <span className="text-xs text-gray-500">
                                                            Chiqdi: {formatDateTime(post.publishedAt)}
                                                        </span>
                                                    ) : (
                                                        <>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => setDraft(toDraft(post))}
                                                                className="min-h-[36px]"
                                                            >
                                                                Tahrirlash
                                                            </Button>

                                                            {isApproved ? (
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() =>
                                                                        run(
                                                                            () => unapprove.mutateAsync(post.id),
                                                                            "Qoralamaga qaytarildi",
                                                                        )
                                                                    }
                                                                    className="min-h-[36px]"
                                                                >
                                                                    Qaytarish
                                                                </Button>
                                                            ) : (
                                                                <Button
                                                                    size="sm"
                                                                    onClick={() =>
                                                                        run(
                                                                            () => approve.mutateAsync(post.id),
                                                                            "Post tasdiqlandi",
                                                                        )
                                                                    }
                                                                    className="min-h-[36px]"
                                                                >
                                                                    Tasdiqlash
                                                                </Button>
                                                            )}

                                                            <Button
                                                                size="sm"
                                                                variant="danger"
                                                                onClick={() => {
                                                                    if (window.confirm("Ushbu postni o'chirishni tasdiqlaysizmi?")) {
                                                                        void run(
                                                                            () => deletePost.mutateAsync(post.id),
                                                                            "Post o'chirildi",
                                                                        );
                                                                    }
                                                                }}
                                                                className="min-h-[36px]"
                                                            >
                                                                O'chirish
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}

                        {!isPending && groupedPosts.length === 0 && (
                            <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center dark:border-gray-700">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                    Bu oraliqqa hali post rejalashtirilmagan
                                </div>
                                <p className="mt-1 text-xs text-gray-500">
                                    Telegram kanal yoki boshqa ijtimoiy tarmoqlar uchun birinchi postni qo'shing.
                                </p>
                                <div className="mt-4">
                                    <Button size="sm" onClick={() => setDraft(emptyDraft())} className="min-h-[44px]">
                                        + Birinchi postni yaratish
                                    </Button>
                                </div>
                            </div>
                        )}

                        {isPending && (
                            <div className="p-8 text-center text-sm text-gray-500">
                                Postlar yuklanmoqda…
                            </div>
                        )}
                    </div>
                </ComponentCard>
            </div>

            {/* Post Yaratish / Tahrirlash Modali & Telegram Ko'rinishi */}
            <Modal isOpen={Boolean(draft)} onClose={() => setDraft(null)} className="max-w-[760px] m-4 p-6 sm:p-8">
                {draft && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-800">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                {draft.id ? "Postni tahrirlash" : "Yangi post yaratish"}
                            </h3>
                            <span className="text-xs text-gray-500 font-medium">Maksimal 4000 belgi</span>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-3">
                            <div>
                                <label htmlFor="post-time" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Chiqish vaqti (Toshkent) *
                                </label>
                                <input
                                    id="post-time"
                                    type="datetime-local"
                                    value={draft.publishAt}
                                    onChange={(e) => setDraft({...draft, publishAt: e.target.value})}
                                    className={INPUT_CLASS}
                                />
                            </div>

                            <div>
                                <label htmlFor="post-channel" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Kanal *
                                </label>
                                <select
                                    id="post-channel"
                                    value={draft.channel}
                                    onChange={(e) => setDraft({...draft, channel: e.target.value as MarketingChannel})}
                                    className={INPUT_CLASS}
                                >
                                    {Object.entries(CHANNEL_LABELS).map(([value, label]) => (
                                        <option key={value} value={value}>
                                            {label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label htmlFor="post-segment" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Segment *
                                </label>
                                <select
                                    id="post-segment"
                                    value={draft.segment}
                                    onChange={(e) => setDraft({...draft, segment: e.target.value as MarketingSegment})}
                                    className={INPUT_CLASS}
                                >
                                    {Object.entries(SEGMENT_LABELS).map(([value, label]) => (
                                        <option key={value} value={value}>
                                            {label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="post-title" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Qisqa sarlavha (faqat ichki boshqaruv uchun)
                            </label>
                            <input
                                id="post-title"
                                value={draft.title}
                                onChange={(e) => setDraft({...draft, title: e.target.value})}
                                className={INPUT_CLASS}
                                placeholder="Masalan: PISA 2022 natijalari haqida da'vo"
                            />
                        </div>

                        {/* Telegram xabar pufagi ko'rinishi (Telegram Bubble Preview) */}
                        <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Telegram ko'rinishi (Oldindan ko'rish)
                            </label>
                            <div className="rounded-xl border border-gray-200 bg-[#eef1f5] p-4 dark:border-gray-800 dark:bg-gray-900/60">
                                <div className="max-w-[480px] rounded-xl bg-white p-3.5 shadow-sm dark:bg-gray-800">
                                    {draft.imageUrl && (
                                        <div className="mb-2 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700">
                                            <img
                                                src={draft.imageUrl}
                                                alt="Post preview"
                                                className="h-44 w-full object-cover"
                                                onError={(e) => {
                                                    (e.target as HTMLElement).style.display = "none";
                                                }}
                                            />
                                        </div>
                                    )}
                                    <div className="text-xs text-gray-800 dark:text-gray-200 whitespace-pre-line leading-relaxed">
                                        {draft.body || "Post matni bu yerda ko'rinadi..."}
                                    </div>
                                    <div className="mt-2 flex items-center justify-between text-[11px] text-gray-400">
                                        <span>{draft.promoCode ? `Promo: ${draft.promoCode}` : ""}</span>
                                        <span>{draft.publishAt.slice(11, 16) || "19:00"} ✓</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label htmlFor="post-body" className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                                    Post matni * (faqat dalillar kutubxonasidagi da'volar)
                                </label>
                                <span
                                    className={`text-xs font-medium ${
                                        draft.body.length > MAX_BODY ? "text-error-600 font-bold" : "text-gray-500"
                                    }`}
                                >
                                    {draft.body.length} / {MAX_BODY}
                                </span>
                            </div>
                            <textarea
                                id="post-body"
                                value={draft.body}
                                rows={8}
                                onChange={(e) => setDraft({...draft, body: e.target.value})}
                                className={TEXTAREA_CLASS}
                                placeholder="Post matnini yozing..."
                            />
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                            <div>
                                <label htmlFor="post-promo" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Promo-kod (ixtiyoriy)
                                </label>
                                <input
                                    id="post-promo"
                                    value={draft.promoCode}
                                    onChange={(e) => setDraft({...draft, promoCode: e.target.value})}
                                    className={INPUT_CLASS}
                                    placeholder="Masalan: DTM25"
                                />
                            </div>

                            <div>
                                <label htmlFor="post-image" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Rasm havolasi (ixtiyoriy)
                                </label>
                                <input
                                    id="post-image"
                                    value={draft.imageUrl}
                                    onChange={(e) => setDraft({...draft, imageUrl: e.target.value})}
                                    className={INPUT_CLASS}
                                    placeholder="https://..."
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                            <Button variant="outline" onClick={() => setDraft(null)} className="min-h-[44px]">
                                Bekor qilish
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => handleSave(false)}
                                isPending={savePost.isPending}
                                className="min-h-[44px]"
                            >
                                Qoralama saqlash
                            </Button>
                            <Button
                                onClick={() => handleSave(true)}
                                isPending={savePost.isPending || approve.isPending}
                                className="min-h-[44px]"
                            >
                                Saqlash va Tasdiqlash
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </>
    );
}
