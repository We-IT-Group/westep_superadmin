import apiClient from "../apiClient";
import {AxiosError} from "axios";
import {SubscriptionPlan} from "../../types/types.ts";

export interface SubscriptionPlanRequest {
    name: string;
    slug: string;
    tier: number;
    monthlyPrice: number;
    description: string;
    features: string[];
}

function extractMessage(error: unknown, fallback: string) {
    const err = error as AxiosError<{ message?: string }>;
    return err.response?.data?.message || fallback;
}

export const getAllSubscriptionPlans = async (): Promise<SubscriptionPlan[]> => {
    const {data} = await apiClient.get("/subscription-plans");
    return data;
};

export const getSubscriptionPlanById = async (id: string | undefined): Promise<SubscriptionPlan> => {
    const plans = await getAllSubscriptionPlans();
    const plan = plans.find((item) => item.id === id);
    if (!plan) {
        throw new Error("Obuna paketi topilmadi");
    }
    return plan;
};

export const addSubscriptionPlan = async (body: SubscriptionPlanRequest): Promise<SubscriptionPlan> => {
    try {
        const {data} = await apiClient.post("/subscription-plans", body);
        return data;
    } catch (error) {
        throw new Error(extractMessage(error, "Obuna paketi saqlanmadi"));
    }
};

export const updateSubscriptionPlan = async (
    body: SubscriptionPlanRequest & { id: string },
): Promise<SubscriptionPlan> => {
    try {
        const {id, ...payload} = body;
        const {data} = await apiClient.put(`/subscription-plans/${id}`, payload);
        return data;
    } catch (error) {
        throw new Error(extractMessage(error, "Obuna paketi yangilanmadi"));
    }
};

export const deleteSubscriptionPlan = async (id: string) => {
    try {
        await apiClient.delete(`/subscription-plans/${id}`);
    } catch (error) {
        throw new Error(extractMessage(error, "Obuna paketi o'chirilmadi"));
    }
};
