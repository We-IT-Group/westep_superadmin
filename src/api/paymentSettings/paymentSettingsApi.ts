import {AxiosError} from "axios";
import apiClient from "../apiClient";
import {PaymentSettings, PaymentSettingsFormValues} from "../../types/types.ts";

const getErrorMessage = (error: unknown) => {
    const err = error as AxiosError<{ message?: string }>;
    return err.response?.data?.message || "Payment settings saqlashda xatolik yuz berdi";
};

const sanitizePayload = (values: PaymentSettingsFormValues, includeSecretKey: boolean) => {
    const payload: Record<string, string | number | boolean | undefined> = {
        provider: values.provider,
        displayName: values.displayName.trim() || undefined,
        mode: values.mode,
        merchantId: values.merchantId.trim() || undefined,
        login: values.login.trim() || undefined,
        callbackUrl: values.callbackUrl.trim() || undefined,
        active: values.active,
        primaryConfig: values.primaryConfig,
        priority: Number.isFinite(Number(values.priority)) ? Number(values.priority) : 0,
    };

    if (includeSecretKey) {
        payload.secretKey = values.secretKey.trim() || undefined;
    }

    return payload;
};

export const getPlatformPaymentSettings = async (): Promise<PaymentSettings[]> => {
    const {data} = await apiClient.get("/admin/payment-settings/platform");
    return data;
};

export const createPlatformPaymentSetting = async (values: PaymentSettingsFormValues): Promise<PaymentSettings> => {
    try {
        const {data} = await apiClient.post("/admin/payment-settings/platform", sanitizePayload(values, true));
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
    values: PaymentSettingsFormValues;
}): Promise<PaymentSettings> => {
    try {
        const {data} = await apiClient.put(`/admin/payment-settings/platform/${id}`, sanitizePayload(values, true));
        return data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
};

export const getBusinessPaymentSettings = async (businessId: string): Promise<PaymentSettings[]> => {
    const {data} = await apiClient.get(`/admin/businesses/${businessId}/payment-settings`);
    return data;
};

export const getEffectiveBusinessPaymentSettings = async (businessId: string): Promise<PaymentSettings[]> => {
    const {data} = await apiClient.get(`/admin/businesses/${businessId}/payment-settings/effective`);
    return data;
};

export const createBusinessPaymentSetting = async ({
                                                        businessId,
                                                        values,
                                                    }: {
    businessId: string;
    values: PaymentSettingsFormValues;
}): Promise<PaymentSettings> => {
    try {
        const {data} = await apiClient.post(`/admin/businesses/${businessId}/payment-settings`, sanitizePayload(values, true));
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
    values: PaymentSettingsFormValues;
}): Promise<PaymentSettings> => {
    try {
        const {data} = await apiClient.put(
            `/admin/businesses/${businessId}/payment-settings/${id}`,
            sanitizePayload(values, true),
        );
        return data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
};
