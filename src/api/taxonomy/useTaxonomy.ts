import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {getItem} from "../../utils/utils.ts";
import {
    createCategory,
    createSkillTag,
    createSubcategory,
    deleteCategory,
    deleteSkillTag,
    deleteSubcategory,
    getCategories,
    getSkillTags,
    getSubcategories,
    updateCategory,
    updateSkillTag,
    updateSubcategory
} from "./taxonomyApi.ts";

function requireToken() {
    const token = getItem<string>("accessToken");
    if (!token) throw new Error("Token topilmadi");
}

export const useGetCategories = () =>
    useQuery({
        queryKey: ["taxonomy-categories"],
        queryFn: async () => {
            requireToken();
            return await getCategories();
        },
        retry: false,
    });

export const useGetSubcategories = (categoryId?: string) =>
    useQuery({
        queryKey: ["taxonomy-subcategories", categoryId || "all"],
        queryFn: async () => {
            requireToken();
            return await getSubcategories(categoryId);
        },
        retry: false,
    });

export const useGetSkillTags = (q?: string) =>
    useQuery({
        queryKey: ["taxonomy-skill-tags", q || ""],
        queryFn: async () => {
            requireToken();
            return await getSkillTags(q);
        },
        retry: false,
    });

export const useCreateCategory = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: createCategory,
        onSuccess: async () => {
            await qc.invalidateQueries({queryKey: ["taxonomy-categories"]});
        },
    });
};

export const useUpdateCategory = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({id, values}: { id: string; values: { name: string; description: string } }) =>
            updateCategory(id, values),
        onSuccess: async () => {
            await qc.invalidateQueries({queryKey: ["taxonomy-categories"]});
        },
    });
};

export const useDeleteCategory = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: deleteCategory,
        onSuccess: async () => {
            await qc.invalidateQueries({queryKey: ["taxonomy-categories"]});
        },
    });
};

export const useCreateSubcategory = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: createSubcategory,
        onSuccess: async () => {
            await qc.invalidateQueries({queryKey: ["taxonomy-subcategories"]});
        },
    });
};

export const useUpdateSubcategory = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({id, values}: { id: string; values: { name: string; description: string; categoryId: string } }) =>
            updateSubcategory(id, values),
        onSuccess: async () => {
            await qc.invalidateQueries({queryKey: ["taxonomy-subcategories"]});
        },
    });
};

export const useDeleteSubcategory = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: deleteSubcategory,
        onSuccess: async () => {
            await qc.invalidateQueries({queryKey: ["taxonomy-subcategories"]});
        },
    });
};

export const useCreateSkillTag = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: createSkillTag,
        onSuccess: async () => {
            await qc.invalidateQueries({queryKey: ["taxonomy-skill-tags"]});
        },
    });
};

export const useUpdateSkillTag = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({id, values}: { id: string; values: { name: string; description: string } }) =>
            updateSkillTag(id, values),
        onSuccess: async () => {
            await qc.invalidateQueries({queryKey: ["taxonomy-skill-tags"]});
        },
    });
};

export const useDeleteSkillTag = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: deleteSkillTag,
        onSuccess: async () => {
            await qc.invalidateQueries({queryKey: ["taxonomy-skill-tags"]});
        },
    });
};
