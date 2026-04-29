import apiClient from "../apiClient";
import {AxiosError} from "axios";
import {CourseLanguage, CourseLanguageFormValues} from "../../types/types.ts";

function extractMessage(error: unknown, fallback: string) {
    const err = error as AxiosError<{ message?: string }>;
    return err.response?.data?.message || fallback;
}

export const getAllCourseLanguages = async (): Promise<CourseLanguage[]> => {
    const {data} = await apiClient.get("/admin/course-languages");
    return data;
};

export const getCourseLanguageById = async (id: string | undefined): Promise<CourseLanguage> => {
    const languages = await getAllCourseLanguages();
    const language = languages.find((item) => item.id === id);
    if (!language) {
        throw new Error("Kurs tili topilmadi");
    }
    return language;
};

export const addCourseLanguage = async (body: CourseLanguageFormValues): Promise<CourseLanguage> => {
    try {
        const {data} = await apiClient.post("/admin/course-languages", body);
        return data;
    } catch (error) {
        throw new Error(extractMessage(error, "Kurs tili saqlanmadi"));
    }
};

export const updateCourseLanguage = async (
    body: CourseLanguageFormValues & { id: string },
): Promise<CourseLanguage> => {
    try {
        const {data} = await apiClient.put(`/admin/course-languages/${body.id}`, {
            name: body.name,
            code: body.code,
        });
        return data;
    } catch (error) {
        throw new Error(extractMessage(error, "Kurs tili yangilanmadi"));
    }
};

export const deleteCourseLanguage = async (id: string) => {
    try {
        await apiClient.delete(`/admin/course-languages/${id}`);
    } catch (error) {
        throw new Error(extractMessage(error, "Kurs tili o'chmadi"));
    }
};
