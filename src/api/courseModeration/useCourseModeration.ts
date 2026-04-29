import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {getItem} from "../../utils/utils.ts";
import {
    approveCourseModeration,
    getCourseModerationList,
    rejectCourseModeration
} from "./courseModerationApi.ts";

const ensureToken = () => {
    const token = getItem<string>("accessToken");
    if (!token) throw new Error("No token");
};

export const useGetCourseModerationList = ({
    status,
    page,
    size,
}: {
    status?: string;
    page: number;
    size: number;
}) =>
    useQuery({
        queryKey: ["course-moderation", status || "ALL", page, size],
        queryFn: async () => {
            ensureToken();
            return await getCourseModerationList({status, page, size});
        },
        retry: false,
    });

export const useApproveCourseModeration = () => {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: approveCourseModeration,
        onSuccess: async () => {
            await qc.invalidateQueries({queryKey: ["course-moderation"]});
        },
    });
};

export const useRejectCourseModeration = () => {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: ({courseId, note}: { courseId: string; note: string }) =>
            rejectCourseModeration(courseId, note),
        onSuccess: async () => {
            await qc.invalidateQueries({queryKey: ["course-moderation"]});
        },
    });
};
