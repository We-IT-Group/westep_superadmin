import apiClient from "../apiClient";
import {AxiosError} from "axios";

export type AgeGroupValue = "KIDS_5_8" | "JUNIOR_9_12" | "TEEN_13_17";

export interface InterestQuizOptionPayload {
    text: string;
    emoji?: string | null;
    orderIndex?: number;
    fieldWeights: Record<string, number>;
}

export interface InterestQuizQuestionPayload {
    text: string;
    ageGroup: AgeGroupValue;
    orderIndex?: number;
    active?: boolean;
    options: InterestQuizOptionPayload[];
}

export interface InterestQuizOptionItem {
    id: string;
    text: string;
    emoji?: string | null;
    orderIndex?: number;
    fieldWeights: Record<string, number>;
}

export interface InterestQuizQuestionItem {
    id: string;
    text: string;
    ageGroup: AgeGroupValue;
    orderIndex?: number;
    active?: boolean;
    options: InterestQuizOptionItem[];
}

export interface ProfessionFieldOption {
    key: string;
    label: string;
}

function extractMessage(error: unknown, fallback: string) {
    const err = error as AxiosError<{ message?: string }>;
    return err.response?.data?.message || fallback;
}

export const getInterestQuizQuestions = async (): Promise<InterestQuizQuestionItem[]> => {
    const {data} = await apiClient.get("/admin/interest-quiz/questions");
    return data;
};

export const createInterestQuizQuestion = async (body: InterestQuizQuestionPayload): Promise<InterestQuizQuestionItem> => {
    try {
        const {data} = await apiClient.post("/admin/interest-quiz/questions", body);
        return data;
    } catch (error) {
        throw new Error(extractMessage(error, "Savol saqlanmadi"));
    }
};

export const updateInterestQuizQuestion = async (id: string, body: InterestQuizQuestionPayload): Promise<InterestQuizQuestionItem> => {
    try {
        const {data} = await apiClient.put(`/admin/interest-quiz/questions/${id}`, body);
        return data;
    } catch (error) {
        throw new Error(extractMessage(error, "Savol yangilanmadi"));
    }
};

export const deleteInterestQuizQuestion = async (id: string): Promise<void> => {
    try {
        await apiClient.delete(`/admin/interest-quiz/questions/${id}`);
    } catch (error) {
        throw new Error(extractMessage(error, "Savol o'chirilmadi"));
    }
};

export const getProfessionFields = async (): Promise<ProfessionFieldOption[]> => {
    const {data} = await apiClient.get("/professions/fields");
    const fields = data?.fields ?? data ?? [];
    return (fields as Array<{ key?: string; fieldKey?: string; label?: string }>).map((item) => ({
        key: item.key || item.fieldKey || "",
        label: item.label || item.key || item.fieldKey || "",
    })).filter((item) => item.key);
};
