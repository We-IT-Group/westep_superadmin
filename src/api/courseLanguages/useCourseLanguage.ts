import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {useNavigate} from "react-router";
import {getItem} from "../../utils/utils.ts";
import {
    addCourseLanguage,
    deleteCourseLanguage,
    getAllCourseLanguages,
    getCourseLanguageById,
    updateCourseLanguage
} from "./courseLanguageApi.ts";

export const useGetCourseLanguages = () =>
    useQuery({
        queryKey: ["course-languages"],
        queryFn: async () => {
            const token = getItem<string>("accessToken");
            if (!token) throw new Error("Token topilmadi");
            return await getAllCourseLanguages();
        },
        retry: false,
    });

export const useGetCourseLanguageById = (id: string | undefined) =>
    useQuery({
        queryKey: ["course-language", id],
        queryFn: async () => {
            const token = getItem<string>("accessToken");
            if (!token) throw new Error("Token topilmadi");
            return await getCourseLanguageById(id);
        },
        enabled: Boolean(id),
        retry: false,
    });

export const useAddCourseLanguage = () => {
    const navigate = useNavigate();
    const qc = useQueryClient();

    return useMutation({
        mutationFn: addCourseLanguage,
        onSuccess: async () => {
            await qc.invalidateQueries({queryKey: ["course-languages"]});
            navigate("/course-languages");
        },
    });
};

export const useUpdateCourseLanguage = () => {
    const navigate = useNavigate();
    const qc = useQueryClient();

    return useMutation({
        mutationFn: updateCourseLanguage,
        onSuccess: async () => {
            await qc.invalidateQueries({queryKey: ["course-languages"]});
            navigate("/course-languages");
        },
    });
};

export const useDeleteCourseLanguage = () => {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: deleteCourseLanguage,
        onSuccess: async () => {
            await qc.invalidateQueries({queryKey: ["course-languages"]});
        },
    });
};
