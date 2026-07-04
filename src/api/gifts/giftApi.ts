import apiClient from "../apiClient";
import {AxiosError} from "axios";

export interface GiftItemDto {
    id: string;
    name: string;
    description?: string | null;
    imageAttachmentId?: string | null;
    coinPrice: number;
    stock?: number | null;
    active?: boolean;
}

export interface GiftItemPayload {
    name: string;
    description?: string | null;
    coinPrice: number;
    stock?: number | null;
    active?: boolean;
}

export type GiftOrderStatusValue = "NEW" | "APPROVED" | "SHIPPED" | "DELIVERED" | "REJECTED";

export interface GiftOrderDto {
    id: string;
    giftItemId?: string | null;
    giftName: string;
    coinPrice: number;
    status: GiftOrderStatusValue;
    mystery: boolean;
    contactPhone?: string | null;
    address?: string | null;
    note?: string | null;
    studentFullName?: string | null;
    studentId?: string | null;
    createdAt?: string | null;
}

export interface GiftOrderPage {
    content: GiftOrderDto[];
    totalElements: number;
}

export interface CoinSettingsDto {
    lessonDefault: number;
    rewatchBonus: number;
    rewatchDailyMax: number;
    gameFullThreshold: number;
    gameFullReward: number;
    gameHalfThreshold: number;
    gameHalfReward: number;
    dailyEarnLimit: number;
}

function extractMessage(error: unknown, fallback: string) {
    const err = error as AxiosError<{ message?: string }>;
    return err.response?.data?.message || fallback;
}

export const getGiftItems = async (): Promise<GiftItemDto[]> => {
    const {data} = await apiClient.get("/admin/gifts");
    return data;
};

export const saveGiftItem = async (id: string | null, body: GiftItemPayload): Promise<GiftItemDto> => {
    try {
        const {data} = id
            ? await apiClient.put(`/admin/gifts/${id}`, body)
            : await apiClient.post("/admin/gifts", body);
        return data;
    } catch (error) {
        throw new Error(extractMessage(error, "Sovg'a saqlanmadi"));
    }
};

export const deleteGiftItem = async (id: string): Promise<void> => {
    try {
        await apiClient.delete(`/admin/gifts/${id}`);
    } catch (error) {
        throw new Error(extractMessage(error, "Sovg'a o'chirilmadi"));
    }
};

export const getGiftOrders = async (status: string, page: number, size: number): Promise<GiftOrderPage> => {
    const {data} = await apiClient.get("/admin/gifts/orders", {
        params: {status: status || undefined, page, size},
    });
    return data;
};

export const setGiftOrderStatus = async (
    orderId: string, status: GiftOrderStatusValue, note?: string,
): Promise<GiftOrderDto> => {
    try {
        const {data} = await apiClient.post(`/admin/gifts/orders/${orderId}/status`,
            note ? {note} : {}, {params: {status}});
        return data;
    } catch (error) {
        throw new Error(extractMessage(error, "Holat o'zgartirilmadi"));
    }
};

export const sendMysteryGift = async (studentId: string, note?: string): Promise<GiftOrderDto> => {
    try {
        const {data} = await apiClient.post("/admin/gifts/mystery", {studentId, note});
        return data;
    } catch (error) {
        throw new Error(extractMessage(error, "Sirli sovg'a yuborilmadi"));
    }
};

export const getCoinSettings = async (): Promise<CoinSettingsDto> => {
    const {data} = await apiClient.get("/admin/coin-settings");
    return data;
};

export const saveCoinSettings = async (body: CoinSettingsDto): Promise<CoinSettingsDto> => {
    try {
        const {data} = await apiClient.put("/admin/coin-settings", body);
        return data;
    } catch (error) {
        throw new Error(extractMessage(error, "Sozlamalar saqlanmadi"));
    }
};
