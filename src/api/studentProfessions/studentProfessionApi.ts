import apiClient from "../apiClient";
import {AxiosError} from "axios";

export type StudentProfessionStatusValue =
    | "UNDER_REVIEW"
    | "CONFIRMED"
    | "RESELECTING"
    | "COMPLETED"
    | "ABANDONED";

export interface StudentProfessionItem {
    id: string;
    userId?: string | null;
    professionId: string;
    slug: string;
    emoji?: string | null;
    title: string;
    status: StudentProfessionStatusValue;
    source: string;
    matchScore?: number | null;
    reviewNote?: string | null;
    selectedAt?: string | null;
    confirmedAt?: string | null;
}

export interface ProfessionFitPart {
    key: string;
    label: string;
    score: number;
}

export interface StudentFitItem {
    professionId: string;
    slug: string;
    title?: string | null;
    emoji?: string | null;
    fit?: number | null;
    fitParts?: { interest: number | null; strengths: number | null; values: number | null } | null;
    matches?: ProfessionFitPart[];
    gaps?: ProfessionFitPart[];
}

export interface StudentFitResponse {
    hasQuizResult: boolean;
    recommendations: StudentFitItem[];
}

export interface StudentProfessionPage {
    content: StudentProfessionItem[];
    totalElements: number;
    totalPages: number;
    number: number;
}

function extractMessage(error: unknown, fallback: string) {
    const err = error as AxiosError<{ message?: string }>;
    return err.response?.data?.message || fallback;
}

export const getStudentFit = async (userId: string): Promise<StudentFitResponse> => {
    try {
        const {data} = await apiClient.get(`/admin/student-professions/students/${userId}/fit`);
        return data;
    } catch (error) {
        throw new Error(extractMessage(error, "Moslikni yuklab bo'lmadi"));
    }
};

export const getStudentProfessions = async (
    status: string,
    page: number,
    size: number,
): Promise<StudentProfessionPage> => {
    const {data} = await apiClient.get("/admin/student-professions", {
        params: {status: status || undefined, page, size},
    });
    return data;
};

export const reviewStudentProfession = async (
    id: string,
    approve: boolean,
    note?: string,
): Promise<StudentProfessionItem> => {
    try {
        const {data} = await apiClient.post(
            `/admin/student-professions/${id}/review`,
            note ? {note} : {},
            {params: {approve}},
        );
        return data;
    } catch (error) {
        throw new Error(extractMessage(error, "Ko'rib chiqishda xatolik"));
    }
};
