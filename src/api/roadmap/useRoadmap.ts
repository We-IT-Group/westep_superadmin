import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {
    getProfessionCourses,
    getProfessionOptions,
    getRoadmapTemplate,
    RoadmapTemplatePayload,
    upsertRoadmapTemplate,
} from "./roadmapApi.ts";

export const useProfessionOptions = () =>
    useQuery({
        queryKey: ["roadmap-profession-options"],
        queryFn: getProfessionOptions,
        retry: false,
    });

export const useProfessionCourses = (idOrSlug: string | undefined) =>
    useQuery({
        queryKey: ["roadmap-profession-courses", idOrSlug],
        queryFn: () => getProfessionCourses(idOrSlug!),
        enabled: Boolean(idOrSlug),
        retry: false,
    });

export const useRoadmapTemplate = (professionId: string | undefined) =>
    useQuery({
        queryKey: ["roadmap-template", professionId],
        queryFn: () => getRoadmapTemplate(professionId!),
        enabled: Boolean(professionId),
        retry: false,
    });

export const useUpsertRoadmapTemplate = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({professionId, body}: { professionId: string; body: RoadmapTemplatePayload }) =>
            upsertRoadmapTemplate(professionId, body),
        onSuccess: (_, {professionId}) =>
            queryClient.invalidateQueries({queryKey: ["roadmap-template", professionId]}),
    });
};
