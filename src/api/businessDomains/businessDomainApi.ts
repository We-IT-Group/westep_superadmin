import apiClient from "../apiClient";
import {AxiosError} from "axios";
import {BusinessDomain, BusinessDomainFormValues} from "../../types/types.ts";

const getErrorMessage = (error: unknown) => {
    const err = error as AxiosError<{ message?: string }>;
    return err.response?.data?.message || "Xatolik yuz berdi";
};

export const getAllBusinessDomains = async (): Promise<BusinessDomain[]> => {
    const {data} = await apiClient.get("/admin/business-domains");
    return data;
};

export const getBusinessDomainById = async (id: string | undefined): Promise<BusinessDomain> => {
    const domains = await getAllBusinessDomains();
    const domain = domains.find((item) => item.id === id);
    if (!domain) {
        throw new Error("Domain mapping topilmadi");
    }
    return domain;
};

export const addBusinessDomain = async (body: BusinessDomainFormValues) => {
    try {
        const {data} = await apiClient.post("/admin/business-domains", body);
        return data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
};

export const updateBusinessDomain = async (body: BusinessDomainFormValues & { id: string }) => {
    try {
        const {id, ...payload} = body;
        const {data} = await apiClient.put("/admin/business-domains/" + id, payload);
        return data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
};

export const deleteBusinessDomain = async (id: string) => {
    try {
        await apiClient.delete("/admin/business-domains/" + id);
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
};
