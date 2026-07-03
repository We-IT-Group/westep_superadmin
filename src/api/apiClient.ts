import axios from "axios";
import {getItem, removeItem, setItem} from "../utils/utils.ts";

const envBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
const isLocalDevelopmentHost =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
const defaultBaseUrl = isLocalDevelopmentHost ? "http://localhost:8080/api" : "https://westep.uz/api";

// export const baseUrl = "http://185.217.131.134:8080/api"
export const baseUrl = envBaseUrl || defaultBaseUrl;

const apiClient = axios.create({
    baseURL: baseUrl,
    withCredentials: true,
});

// Access tokenni headerga qo‘shish
apiClient.interceptors.request.use((config) => {
    const token = getItem<string>("accessToken");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Token refresh logikasi
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const refreshToken = getItem<string>("refreshToken");
            if (!refreshToken) return Promise.reject(error);

            try {
                const {data} = await axios.post(`${baseUrl}/auth/refresh`, {}, {
                    params: {refreshToken: refreshToken},
                });

                setItem<string>("accessToken", data.accessToken);
                setItem<string>("refreshToken", data.refreshToken);
                apiClient.defaults.headers.Authorization = `Bearer ${data.accessToken}`;
                return apiClient(originalRequest);
            } catch (err) {
                removeItem("accessToken");
                removeItem("refreshToken");
                return Promise.reject(err);
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;
