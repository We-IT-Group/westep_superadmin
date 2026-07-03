import {AxiosError} from "axios";
import apiClient from "../apiClient";
import {
    TaxonomyCategory,
    TaxonomyCategoryFormValues,
    TaxonomySkillTag,
    TaxonomySkillTagFormValues,
    TaxonomySubcategory,
    TaxonomySubcategoryFormValues
} from "../../types/types.ts";

function extractMessage(error: unknown, fallback: string) {
    const err = error as AxiosError<{ message?: string }>;
    return err.response?.data?.message || fallback;
}

export const getCategories = async (): Promise<TaxonomyCategory[]> => {
    const {data} = await apiClient.get("/admin/taxonomy/categories");
    return data;
};

export const createCategory = async (body: TaxonomyCategoryFormValues): Promise<TaxonomyCategory> => {
    try {
        const {data} = await apiClient.post("/admin/taxonomy/categories", body);
        return data;
    } catch (error) {
        throw new Error(extractMessage(error, "Kategoriya saqlanmadi"));
    }
};

export const updateCategory = async (
    id: string,
    body: TaxonomyCategoryFormValues,
): Promise<TaxonomyCategory> => {
    try {
        const {data} = await apiClient.put(`/admin/taxonomy/categories/${id}`, body);
        return data;
    } catch (error) {
        throw new Error(extractMessage(error, "Kategoriya yangilanmadi"));
    }
};

export const deleteCategory = async (id: string) => {
    try {
        await apiClient.delete(`/admin/taxonomy/categories/${id}`);
    } catch (error) {
        throw new Error(extractMessage(error, "Kategoriya o'chmadi"));
    }
};

export const getSubcategories = async (categoryId?: string): Promise<TaxonomySubcategory[]> => {
    const {data} = await apiClient.get("/admin/taxonomy/subcategories", {
        params: categoryId ? {categoryId} : undefined,
    });
    return data;
};

export const createSubcategory = async (body: TaxonomySubcategoryFormValues): Promise<TaxonomySubcategory> => {
    try {
        const {data} = await apiClient.post("/admin/taxonomy/subcategories", body);
        return data;
    } catch (error) {
        throw new Error(extractMessage(error, "Subkategoriya saqlanmadi"));
    }
};

export const updateSubcategory = async (
    id: string,
    body: TaxonomySubcategoryFormValues,
): Promise<TaxonomySubcategory> => {
    try {
        const {data} = await apiClient.put(`/admin/taxonomy/subcategories/${id}`, body);
        return data;
    } catch (error) {
        throw new Error(extractMessage(error, "Subkategoriya yangilanmadi"));
    }
};

export const deleteSubcategory = async (id: string) => {
    try {
        await apiClient.delete(`/admin/taxonomy/subcategories/${id}`);
    } catch (error) {
        throw new Error(extractMessage(error, "Subkategoriya o'chmadi"));
    }
};

export const getSkillTags = async (q?: string): Promise<TaxonomySkillTag[]> => {
    const {data} = await apiClient.get("/admin/taxonomy/skill-tags", {
        params: q?.trim() ? {q: q.trim()} : undefined,
    });
    return data;
};

export const createSkillTag = async (body: TaxonomySkillTagFormValues): Promise<TaxonomySkillTag> => {
    try {
        const {data} = await apiClient.post("/admin/taxonomy/skill-tags", body);
        return data;
    } catch (error) {
        throw new Error(extractMessage(error, "Skill tag saqlanmadi"));
    }
};

export const updateSkillTag = async (
    id: string,
    body: TaxonomySkillTagFormValues,
): Promise<TaxonomySkillTag> => {
    try {
        const {data} = await apiClient.put(`/admin/taxonomy/skill-tags/${id}`, body);
        return data;
    } catch (error) {
        throw new Error(extractMessage(error, "Skill tag yangilanmadi"));
    }
};

export const deleteSkillTag = async (id: string) => {
    try {
        await apiClient.delete(`/admin/taxonomy/skill-tags/${id}`);
    } catch (error) {
        throw new Error(extractMessage(error, "Skill tag o'chmadi"));
    }
};
