import {useQuery} from "@tanstack/react-query";
import {getItem} from "../../utils/utils.ts";
import {getAllBusinesses} from "./businessApi.ts";

export const useGetBusinesses = () =>
    useQuery({
        queryKey: ["businesses"],
        queryFn: async () => {
            const token = getItem<string>("accessToken");
            if (!token) throw new Error("No token");
            return await getAllBusinesses();
        },
        retry: false,
    });
