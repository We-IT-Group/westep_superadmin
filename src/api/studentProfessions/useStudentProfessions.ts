import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {getItem} from "../../utils/utils.ts";
import {getStudentProfessions, reviewStudentProfession} from "./studentProfessionApi.ts";

export const useGetStudentProfessions = (status: string, page: number, size: number) =>
    useQuery({
        queryKey: ["student-professions", status, page, size],
        queryFn: async () => {
            const token = getItem<string>("accessToken");
            if (!token) throw new Error("Token topilmadi");
            return await getStudentProfessions(status, page, size);
        },
        retry: false,
    });

export const useReviewStudentProfession = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({id, approve, note}: { id: string; approve: boolean; note?: string }) =>
            reviewStudentProfession(id, approve, note),
        onSuccess: () => queryClient.invalidateQueries({queryKey: ["student-professions"]}),
    });
};
