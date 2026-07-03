import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {getItem} from "../../utils/utils.ts";
import {
    createAppLanguage,
    createOrUpdateTranslation,
    deleteAppLanguage,
    getAdminAppLanguages,
    getAdminTranslations,
    getAppLanguages,
    updateAppLanguage
} from "./appTranslationApi.ts";
import {TranslationFilters} from "../../types/types.ts";

function requireToken() {
    const token = getItem<string>("accessToken");
    if (!token) throw new Error("Token topilmadi");
}

export const useGetAppLanguages = () =>
    useQuery({
        queryKey: ["app-languages"],
        queryFn: async () => {
            requireToken();
            return await getAppLanguages();
        },
        retry: false,
    });

export const useGetAdminAppLanguages = () =>
    useQuery({
        queryKey: ["admin-app-languages"],
        queryFn: async () => {
            requireToken();
            return await getAdminAppLanguages();
        },
        retry: false,
    });

function invalidateLanguages(qc: ReturnType<typeof useQueryClient>) {
    return Promise.all([
        qc.invalidateQueries({queryKey: ["app-languages"]}),
        qc.invalidateQueries({queryKey: ["admin-app-languages"]}),
    ]);
}

export const useCreateAppLanguage = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: createAppLanguage,
        onSuccess: async () => {
            await invalidateLanguages(qc);
        },
    });
};

export const useUpdateAppLanguage = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: updateAppLanguage,
        onSuccess: async () => {
            await invalidateLanguages(qc);
        },
    });
};

export const useDeleteAppLanguage = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: deleteAppLanguage,
        onSuccess: async () => {
            await invalidateLanguages(qc);
        },
    });
};

export const useGetAdminTranslations = (filters: TranslationFilters) =>
    useQuery({
        queryKey: ["admin-translations", filters],
        queryFn: async () => {
            requireToken();
            return await getAdminTranslations(filters);
        },
        enabled: Boolean(filters.languageId),
        retry: false,
    });

export const useCreateOrUpdateTranslation = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: createOrUpdateTranslation,
        onSuccess: async () => {
            await qc.invalidateQueries({queryKey: ["admin-translations"]});
        },
    });
};
