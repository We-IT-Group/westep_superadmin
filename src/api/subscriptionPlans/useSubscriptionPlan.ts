import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {useNavigate} from "react-router";
import {getItem} from "../../utils/utils.ts";
import {
    addSubscriptionPlan,
    deleteSubscriptionPlan,
    getAllSubscriptionPlans,
    getSubscriptionPlanById,
    updateSubscriptionPlan
} from "./subscriptionPlanApi.ts";

export const useGetSubscriptionPlans = () =>
    useQuery({
        queryKey: ["subscription-plans"],
        queryFn: async () => {
            const token = getItem<string>("accessToken");
            if (!token) throw new Error("Token topilmadi");
            return await getAllSubscriptionPlans();
        },
        retry: false,
    });

export const useGetSubscriptionPlanById = (id: string | undefined) =>
    useQuery({
        queryKey: ["subscription-plan", id],
        queryFn: async () => {
            const token = getItem<string>("accessToken");
            if (!token) throw new Error("Token topilmadi");
            return await getSubscriptionPlanById(id);
        },
        enabled: Boolean(id),
        retry: false,
    });

export const useAddSubscriptionPlan = () => {
    const navigate = useNavigate();
    const qc = useQueryClient();

    return useMutation({
        mutationFn: addSubscriptionPlan,
        onSuccess: async () => {
            await qc.invalidateQueries({queryKey: ["subscription-plans"]});
            navigate("/subscription-plans");
        },
    });
};

export const useUpdateSubscriptionPlan = () => {
    const navigate = useNavigate();
    const qc = useQueryClient();

    return useMutation({
        mutationFn: updateSubscriptionPlan,
        onSuccess: async () => {
            await qc.invalidateQueries({queryKey: ["subscription-plans"]});
            navigate("/subscription-plans");
        },
    });
};

export const useDeleteSubscriptionPlan = () => {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: deleteSubscriptionPlan,
        onSuccess: async () => {
            await qc.invalidateQueries({queryKey: ["subscription-plans"]});
        },
    });
};
