import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {
    createBusinessPaymentSetting,
    createPlatformPaymentSetting,
    getBusinessPaymentSettings,
    getEffectiveBusinessPaymentSettings,
    getPlatformPaymentSettings,
    updateBusinessPaymentSetting,
    updatePlatformPaymentSetting
} from "./paymentSettingsApi.ts";
import {getItem} from "../../utils/utils.ts";

const ensureToken = () => {
    const token = getItem<string>("accessToken");
    if (!token) throw new Error("No token");
};

export const useGetPlatformPaymentSettings = () =>
    useQuery({
        queryKey: ["platform-payment-settings"],
        queryFn: async () => {
            ensureToken();
            return await getPlatformPaymentSettings();
        },
        retry: false,
    });

export const useCreatePlatformPaymentSetting = () => {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: createPlatformPaymentSetting,
        onSuccess: async () => {
            await qc.invalidateQueries({queryKey: ["platform-payment-settings"]});
        },
    });
};

export const useUpdatePlatformPaymentSetting = () => {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: updatePlatformPaymentSetting,
        onSuccess: async () => {
            await qc.invalidateQueries({queryKey: ["platform-payment-settings"]});
        },
    });
};

export const useGetBusinessPaymentSettings = (businessId?: string, enabled = true) =>
    useQuery({
        queryKey: ["business-payment-settings", businessId],
        queryFn: async () => {
            ensureToken();
            return await getBusinessPaymentSettings(businessId as string);
        },
        enabled: enabled && !!businessId,
        retry: false,
    });

export const useGetEffectiveBusinessPaymentSettings = (businessId?: string, enabled = true) =>
    useQuery({
        queryKey: ["business-effective-payment-settings", businessId],
        queryFn: async () => {
            ensureToken();
            return await getEffectiveBusinessPaymentSettings(businessId as string);
        },
        enabled: enabled && !!businessId,
        retry: false,
    });

export const useCreateBusinessPaymentSetting = () => {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: createBusinessPaymentSetting,
        onSuccess: async (_, variables) => {
            await qc.invalidateQueries({queryKey: ["business-payment-settings", variables.businessId]});
            await qc.invalidateQueries({queryKey: ["business-effective-payment-settings", variables.businessId]});
        },
    });
};

export const useUpdateBusinessPaymentSetting = () => {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: updateBusinessPaymentSetting,
        onSuccess: async (_, variables) => {
            await qc.invalidateQueries({queryKey: ["business-payment-settings", variables.businessId]});
            await qc.invalidateQueries({queryKey: ["business-effective-payment-settings", variables.businessId]});
        },
    });
};
