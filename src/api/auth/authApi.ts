// src/api/courseApi.ts
import apiClient from "../apiClient";
import {getItem, setItem} from "../../utils/utils.ts";
import {AxiosError} from "axios";
// import {BusinessType} from "../../types/types.ts";


export const login = async ({phone, password}: { phone: string; password: string }) => {
    try {
        const {data} = await apiClient.post("/auth/login", {}, {
            params: {
                phone: phone,
                password: password,
            }
        });
        setItem<string>("accessToken", data?.accessToken)
        setItem<string>("refreshToken", data?.refreshToken)
    } catch (error) {
        const err = error as AxiosError<{ message: string }>;
        const message = err.response?.data?.message;
        throw new Error(message);
    }
};

// export const register = async (body: BusinessType) => {
//     try {
//         const response = await apiClient.post("/business/register", body);
//         return response;
//     } catch (error) {
//         console.log(error);
//         const err = error as AxiosError<{ message: string }>;
//         const message = err.response?.data?.message;
//         throw new Error(message);
//     }
// };

export const getCurrentUser = async () => {
    const {data} = await apiClient.get("/user/me");
    return data;
};


export const logout = async () => {
    const refreshToken: string | null = getItem<string>("refreshToken");
    await apiClient.post("/auth/logout", refreshToken, {
        headers: {
            "Content-Type": "text/plain"
        }
    });
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
};