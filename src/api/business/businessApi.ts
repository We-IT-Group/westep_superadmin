import apiClient from "../apiClient";
import {Business} from "../../types/types.ts";

export const getAllBusinesses = async (): Promise<Business[]> => {
    const {data} = await apiClient.get("/business/all");
    return data;
};
