import apiClient from "../apiClient";
import {AxiosError} from "axios";


export const addRole = async (body: { name: string; permissions: string[] }) => {
    try {
        await apiClient.post("/role", body);
    } catch (error) {
        const err = error as AxiosError<{ message: string }>;
        const message = err.response?.data?.message;
        throw new Error(message);
    }
};

export const updateRole = async (body: { name: string; permissions: string[], id: string }) => {
    try {
        await apiClient.put("/role/" + body.id, body);
    } catch (error) {
        const err = error as AxiosError<{ message: string }>;
        const message = err.response?.data?.message;
        throw new Error(message);
    }
};

export const deleteRole = async (id: string) => {
    try {
        await apiClient.delete("/role/" + id);
    } catch (error) {
        const err = error as AxiosError<{ message: string }>;
        const message = err.response?.data?.message;
        throw new Error(message);
    }
};


export const getAllRoles = async () => {
    const {data} = await apiClient.get("/role");
    return data;
};

export const getRoleById = async (id: string | undefined) => {
    const {data} = await apiClient.get("/role/" + id);
    return data;
};
