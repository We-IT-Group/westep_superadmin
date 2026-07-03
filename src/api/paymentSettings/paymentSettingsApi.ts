import {AxiosError} from "axios";
import apiClient from "../apiClient";
import {PaymentProviderSettingsRequest, PaymentProviderSettingsResponse} from "../../types/types.ts";

const getErrorMessage = (error: unknown) => {
    const err = error as AxiosError<{ message?: string; error?: string }>;

    if (err.response?.status === 403) {
        return "Sizda payment settingsni boshqarish uchun ruxsat yo'q";
    }

    return err.response?.data?.message || err.response?.data?.error || "Payment settings saqlashda xatolik yuz berdi";
};

const sanitizeText = (value: string) => {
    const trimmedValue = value.trim();
    return trimmedValue.length > 0 ? trimmedValue : undefined;
};

const sanitizePayload = (values: PaymentProviderSettingsRequest) => {
    const payload: Record<string, string | number | boolean | undefined> = {
        provider: values.provider,
        usage: values.usage || undefined,
        displayName: sanitizeText(values.displayName),
        mode: values.mode,
        active: values.active,
        primaryConfig: values.primaryConfig,
        testMerchantId: sanitizeText(values.testMerchantId),
        testLogin: sanitizeText(values.testLogin),
        testSecretKey: sanitizeText(values.testSecretKey),
        prodMerchantId: sanitizeText(values.prodMerchantId),
        prodLogin: sanitizeText(values.prodLogin),
        prodSecretKey: sanitizeText(values.prodSecretKey),
        callbackUrl: sanitizeText(values.callbackUrl),
        priority: Number.isFinite(Number(values.priority)) ? Number(values.priority) : 0,
    };

    return payload;
};

export const getPlatformPaymentSettings = async (): Promise<PaymentProviderSettingsResponse[]> => {
    try {
        const {data} = await apiClient.get("/admin/payment-settings/platform");
        return data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
};

export const createPlatformPaymentSetting = async (values: PaymentProviderSettingsRequest): Promise<PaymentProviderSettingsResponse> => {
    try {
        const {data} = await apiClient.post("/admin/payment-settings/platform", sanitizePayload(values));
        return data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
};

export const updatePlatformPaymentSetting = async ({
                                                        id,
                                                        values,
                                                    }: {
    id: string;
    values: PaymentProviderSettingsRequest;
}): Promise<PaymentProviderSettingsResponse> => {
    try {
        const {data} = await apiClient.put(`/admin/payment-settings/platform/${id}`, sanitizePayload(values));
        return data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
};

export const getBusinessPaymentSettings = async (businessId: string): Promise<PaymentProviderSettingsResponse[]> => {
    try {
        const {data} = await apiClient.get(`/admin/businesses/${businessId}/payment-settings`);
        return data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
};

export const getEffectiveBusinessPaymentSettings = async (businessId: string): Promise<PaymentProviderSettingsResponse[]> => {
    try {
        const {data} = await apiClient.get(`/admin/businesses/${businessId}/payment-settings/effective`);
        return data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
};

export const createBusinessPaymentSetting = async ({
                                                        businessId,
                                                        values,
                                                    }: {
    businessId: string;
    values: PaymentProviderSettingsRequest;
}): Promise<PaymentProviderSettingsResponse> => {
    try {
        const {data} = await apiClient.post(`/admin/businesses/${businessId}/payment-settings`, sanitizePayload(values));
        return data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
};

export const updateBusinessPaymentSetting = async ({
                                                        businessId,
                                                        id,
                                                        values,
                                                    }: {
    businessId: string;
    id: string;
    values: PaymentProviderSettingsRequest;
}): Promise<PaymentProviderSettingsResponse> => {
    try {
        const {data} = await apiClient.put(
            `/admin/businesses/${businessId}/payment-settings/${id}`,
            sanitizePayload(values),
        );
        return data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
};
