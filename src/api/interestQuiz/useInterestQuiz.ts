import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {getItem} from "../../utils/utils.ts";
import {
    createInterestQuizQuestion,
    deleteInterestQuizQuestion,
    getInterestQuizQuestions,
    getProfessionFields,
    InterestQuizQuestionPayload,
    updateInterestQuizQuestion,
} from "./interestQuizApi.ts";

export const useGetInterestQuizQuestions = () =>
    useQuery({
        queryKey: ["interest-quiz-questions"],
        queryFn: async () => {
            const token = getItem<string>("accessToken");
            if (!token) throw new Error("Token topilmadi");
            return await getInterestQuizQuestions();
        },
        retry: false,
    });

export const useGetProfessionFields = () =>
    useQuery({
        queryKey: ["profession-fields"],
        queryFn: getProfessionFields,
        retry: false,
    });

export const useCreateInterestQuizQuestion = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createInterestQuizQuestion,
        onSuccess: () => queryClient.invalidateQueries({queryKey: ["interest-quiz-questions"]}),
    });
};

export const useUpdateInterestQuizQuestion = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({id, body}: { id: string; body: InterestQuizQuestionPayload }) =>
            updateInterestQuizQuestion(id, body),
        onSuccess: () => queryClient.invalidateQueries({queryKey: ["interest-quiz-questions"]}),
    });
};

export const useDeleteInterestQuizQuestion = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteInterestQuizQuestion,
        onSuccess: () => queryClient.invalidateQueries({queryKey: ["interest-quiz-questions"]}),
    });
};
