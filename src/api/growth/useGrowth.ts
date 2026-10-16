import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {
    approveMarketingPost,
    deleteGrowthTask,
    deleteMarketingPost,
    deleteSchoolLead,
    getGrowthSummary,
    getGrowthTasks,
    getMarketingPosts,
    getSchoolLeads,
    GrowthTaskPayload,
    GrowthTaskStatus,
    MarketingPostPayload,
    saveGrowthTask,
    saveMarketingPost,
    saveSchoolLead,
    SchoolLeadPayload,
    sendGrowthBrief,
    setGrowthTaskStatus,
    unapproveMarketingPost,
} from "./growthApi.ts";

const TASKS = ["growth-tasks"];
const POSTS = ["growth-posts"];
const SCHOOLS = ["growth-schools"];

export const useGrowthTasks = () => useQuery({queryKey: TASKS, queryFn: getGrowthTasks, retry: false});

export const useSaveGrowthTask = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({id, body}: { id: string | null; body: GrowthTaskPayload }) => saveGrowthTask(id, body),
        onSuccess: () => qc.invalidateQueries({queryKey: TASKS}),
    });
};

export const useSetGrowthTaskStatus = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({id, status}: { id: string; status: GrowthTaskStatus }) => setGrowthTaskStatus(id, status),
        onSuccess: () => qc.invalidateQueries({queryKey: TASKS}),
    });
};

export const useDeleteGrowthTask = () => {
    const qc = useQueryClient();
    return useMutation({mutationFn: deleteGrowthTask, onSuccess: () => qc.invalidateQueries({queryKey: TASKS})});
};

export const useMarketingPosts = (from: string, to: string) =>
    useQuery({queryKey: [...POSTS, from, to], queryFn: () => getMarketingPosts(from, to), retry: false});

export const useSaveMarketingPost = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({id, body}: { id: string | null; body: MarketingPostPayload }) => saveMarketingPost(id, body),
        onSuccess: () => qc.invalidateQueries({queryKey: POSTS}),
    });
};

export const useApproveMarketingPost = () => {
    const qc = useQueryClient();
    return useMutation({mutationFn: approveMarketingPost, onSuccess: () => qc.invalidateQueries({queryKey: POSTS})});
};

export const useUnapproveMarketingPost = () => {
    const qc = useQueryClient();
    return useMutation({mutationFn: unapproveMarketingPost, onSuccess: () => qc.invalidateQueries({queryKey: POSTS})});
};

export const useDeleteMarketingPost = () => {
    const qc = useQueryClient();
    return useMutation({mutationFn: deleteMarketingPost, onSuccess: () => qc.invalidateQueries({queryKey: POSTS})});
};

export const useSchoolLeads = () => useQuery({queryKey: SCHOOLS, queryFn: getSchoolLeads, retry: false});

export const useSaveSchoolLead = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({id, body}: { id: string | null; body: SchoolLeadPayload }) => saveSchoolLead(id, body),
        onSuccess: () => qc.invalidateQueries({queryKey: SCHOOLS}),
    });
};

export const useDeleteSchoolLead = () => {
    const qc = useQueryClient();
    return useMutation({mutationFn: deleteSchoolLead, onSuccess: () => qc.invalidateQueries({queryKey: SCHOOLS})});
};

export const useGrowthSummary = () =>
    useQuery({queryKey: ["growth-summary"], queryFn: getGrowthSummary, retry: false});

export const useSendGrowthBrief = () => useMutation({mutationFn: sendGrowthBrief});
