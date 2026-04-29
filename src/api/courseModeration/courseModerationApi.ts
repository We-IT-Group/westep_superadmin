import apiClient from "../apiClient";
import {AxiosError} from "axios";
import {CourseModerationListResponse} from "../../types/types.ts";

const getErrorMessage = (error: unknown) => {
    const err = error as AxiosError<{ message?: string }>;
    return err.response?.data?.message || "Kurs moderatsiyasida xatolik";
};

export const getCourseModerationList = async ({
    status,
    page = 0,
    size = 20,
}: {
    status?: string;
    page?: number;
    size?: number;
}): Promise<CourseModerationListResponse> => {
    const {data} = await apiClient.get("/admin/courses/moderation", {
        params: {
            status: status || undefined,
            page,
            size,
        },
    });
    return data;
};

export const approveCourseModeration = async (courseId: string) => {
    try {
        const {data} = await apiClient.post(`/admin/courses/${courseId}/approve`, {});
        return data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
};

export const rejectCourseModeration = async (courseId: string, note: string) => {
    try {
        const {data} = await apiClient.post(`/admin/courses/${courseId}/reject`, {note});
        return data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
};
