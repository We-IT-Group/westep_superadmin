import apiClient from "../apiClient";
import {AxiosError} from "axios";

export type RoadmapItemTypeValue = "COURSE" | "SKILL" | "EXTERNAL";
export type AgeGroupValue = "KIDS_5_8" | "JUNIOR_9_12" | "TEEN_13_17";

export interface RoadmapItemPayload {
    itemType: RoadmapItemTypeValue;
    courseId?: string | null;
    title: string;
    description?: string | null;
    orderIndex?: number;
    required?: boolean;
}

export interface RoadmapStagePayload {
    name: string;
    description?: string | null;
    orderIndex?: number;
    minAgeGroup?: AgeGroupValue | null;
    estimatedWeeks?: number | null;
    items: RoadmapItemPayload[];
}

export interface RoadmapTemplatePayload {
    name: string;
    description?: string | null;
    published?: boolean;
    stages: RoadmapStagePayload[];
}

export interface RoadmapItemDto extends RoadmapItemPayload {
    id: string;
    courseName?: string | null;
}

export interface RoadmapStageDto {
    id: string;
    name: string;
    description?: string | null;
    orderIndex?: number;
    minAgeGroup?: AgeGroupValue | null;
    estimatedWeeks?: number | null;
    items: RoadmapItemDto[];
}

export interface RoadmapTemplateDto {
    id: string;
    professionId: string;
    name: string;
    description?: string | null;
    version: number;
    published: boolean;
    stages: RoadmapStageDto[];
}

export interface ProfessionOption {
    id: string;
    slug: string;
    emoji?: string;
    title: string;
}

export interface ProfessionCourseOption {
    id: string;
    name: string;
}

function extractMessage(error: unknown, fallback: string) {
    const err = error as AxiosError<{ message?: string }>;
    return err.response?.data?.message || fallback;
}

export const getProfessionOptions = async (): Promise<ProfessionOption[]> => {
    const {data} = await apiClient.get("/professions", {params: {lang: "uz", limit: 100}});
    const items = data?.items ?? [];
    return (items as Array<{ id: string; slug: string; emoji?: string; title?: string }>).map((item) => ({
        id: item.id,
        slug: item.slug,
        emoji: item.emoji,
        title: item.title || item.slug,
    }));
};

export const getProfessionCourses = async (idOrSlug: string): Promise<ProfessionCourseOption[]> => {
    const {data} = await apiClient.get(`/professions/${idOrSlug}`, {params: {lang: "uz"}});
    const courses = data?.courses ?? [];
    return (courses as Array<{ id: string; name: string }>).map((c) => ({id: c.id, name: c.name}));
};

export const getRoadmapTemplate = async (professionId: string): Promise<RoadmapTemplateDto | null> => {
    const response = await apiClient.get(`/admin/roadmap-templates/${professionId}`);
    return response.status === 204 ? null : response.data;
};

export const upsertRoadmapTemplate = async (
    professionId: string,
    body: RoadmapTemplatePayload,
): Promise<RoadmapTemplateDto> => {
    try {
        const {data} = await apiClient.put(`/admin/roadmap-templates/${professionId}`, body);
        return data;
    } catch (error) {
        throw new Error(extractMessage(error, "Shablon saqlanmadi"));
    }
};
