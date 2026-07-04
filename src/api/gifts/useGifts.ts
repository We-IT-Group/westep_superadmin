import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {
    CoinSettingsDto,
    deleteGiftItem,
    getCoinSettings,
    getGiftItems,
    getGiftOrders,
    GiftItemPayload,
    GiftOrderStatusValue,
    saveCoinSettings,
    saveGiftItem,
    sendMysteryGift,
    setGiftOrderStatus,
} from "./giftApi.ts";

export const useGiftItems = () =>
    useQuery({queryKey: ["gift-items"], queryFn: getGiftItems, retry: false});

export const useSaveGiftItem = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({id, body}: { id: string | null; body: GiftItemPayload }) => saveGiftItem(id, body),
        onSuccess: () => qc.invalidateQueries({queryKey: ["gift-items"]}),
    });
};

export const useDeleteGiftItem = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: deleteGiftItem,
        onSuccess: () => qc.invalidateQueries({queryKey: ["gift-items"]}),
    });
};

export const useGiftOrders = (status: string, page: number, size: number) =>
    useQuery({
        queryKey: ["gift-orders", status, page, size],
        queryFn: () => getGiftOrders(status, page, size),
        retry: false,
    });

export const useSetGiftOrderStatus = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({orderId, status, note}: { orderId: string; status: GiftOrderStatusValue; note?: string }) =>
            setGiftOrderStatus(orderId, status, note),
        onSuccess: () => qc.invalidateQueries({queryKey: ["gift-orders"]}),
    });
};

export const useSendMysteryGift = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({studentId, note}: { studentId: string; note?: string }) => sendMysteryGift(studentId, note),
        onSuccess: () => qc.invalidateQueries({queryKey: ["gift-orders"]}),
    });
};

export const useCoinSettings = () =>
    useQuery({queryKey: ["coin-settings"], queryFn: getCoinSettings, retry: false});

export const useSaveCoinSettings = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (body: CoinSettingsDto) => saveCoinSettings(body),
        onSuccess: () => qc.invalidateQueries({queryKey: ["coin-settings"]}),
    });
};
