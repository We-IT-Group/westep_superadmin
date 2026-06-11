import {AxiosError} from "axios";
import apiClient from "../apiClient";
import {
    AppLanguage,
    AppLanguageFormValues,
    TranslationFilters,
    TranslationFormValues,
    TranslationItem,
    TranslationListResponse
} from "../../types/types.ts";

function extractMessage(error: unknown, fallback: string) {
    const err = error as AxiosError<{ message?: string }>;
    return err.response?.data?.message || fallback;
}

export const getAppLanguages = async (): Promise<AppLanguage[]> => {
    const {data} = await apiClient.get("/taxonomy/app-languages");
    return data;
};

export const createAppLanguage = async (body: AppLanguageFormValues): Promise<AppLanguage> => {
    try {
        const {data} = await apiClient.post("/admin/taxonomy/app-languages", body);
        return data;
    } catch (error) {
        throw new Error(extractMessage(error, "Til saqlanmadi"));
    }
};

export const getAdminTranslations = async (filters: TranslationFilters): Promise<TranslationListResponse> => {
    const {data} = await apiClient.get("/admin/taxonomy/translations", {
        params: {
            languageId: filters.languageId || undefined,
            namespace: filters.namespace?.trim() || undefined,
            q: filters.q?.trim() || undefined,
            page: filters.page,
            size: filters.size,
        },
    });
    return data;
};

export const createOrUpdateTranslation = async (body: TranslationFormValues): Promise<TranslationItem> => {
    try {
        const {data} = await apiClient.post("/admin/taxonomy/translations", body);
        return data;
    } catch (error) {
        throw new Error(extractMessage(error, "Tarjima saqlanmadi"));
    }
};
