import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {
    addBusinessDomain,
    deleteBusinessDomain,
    getAllBusinessDomains,
    getBusinessDomainById,
    updateBusinessDomain
} from "./businessDomainApi.ts";
import {useNavigate} from "react-router";
import {getItem} from "../../utils/utils.ts";

export const useGetBusinessDomains = () =>
    useQuery({
        queryKey: ["business-domains"],
        queryFn: async () => {
            const token = getItem<string>("accessToken");
            if (!token) throw new Error("No token");
            return await getAllBusinessDomains();
        },
        retry: false,
    });

export const useGetBusinessDomainById = (id: string | undefined) =>
    useQuery({
        queryKey: ["business-domain", id],
        queryFn: async () => {
            const token = getItem<string>("accessToken");
            if (!token) throw new Error("No token");
            return await getBusinessDomainById(id);
        },
        enabled: !!id,
        retry: false,
    });

export const useAddBusinessDomain = () => {
    const navigate = useNavigate();
    const qc = useQueryClient();

    return useMutation({
        mutationFn: addBusinessDomain,
        onSuccess: async () => {
            const domains = await getAllBusinessDomains();
            qc.setQueryData(["business-domains"], domains);
            navigate("/business-domains");
        },
        onError: (error) => {
            alert(error);
        },
    });
};

export const useUpdateBusinessDomain = () => {
    const navigate = useNavigate();
    const qc = useQueryClient();

    return useMutation({
        mutationFn: updateBusinessDomain,
        onSuccess: async (_, variables) => {
            const domains = await getAllBusinessDomains();
            qc.setQueryData(["business-domains"], domains);
            qc.setQueryData(["business-domain", variables.id], domains.find((item) => item.id === variables.id));
            navigate("/business-domains");
        },
        onError: (error) => {
            alert(error);
        },
    });
};

export const useDeleteBusinessDomain = () => {
    const navigate = useNavigate();
    const qc = useQueryClient();

    return useMutation({
        mutationFn: deleteBusinessDomain,
        onSuccess: async () => {
            const domains = await getAllBusinessDomains();
            qc.setQueryData(["business-domains"], domains);
            navigate("/business-domains");
        },
        onError: (error) => {
            alert(error);
        },
    });
};
