import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {getItem} from "../../utils/utils.ts";
import {
    cancelScheduledNotification,
    createScheduledNotification,
    getScheduledNotifications,
    getStudentRecipients,
    type CreateScheduledNotificationRequest
} from "./adminNotificationApi.ts";
import {ScheduledNotificationStatus} from "../../types/types.ts";

function requireToken() {
    const token = getItem<string>("accessToken");
    if (!token) throw new Error("Token topilmadi");
}

export const useGetStudentRecipients = ({
    search,
    page,
    size,
}: {
    search: string;
    page: number;
    size: number;
}) =>
    useQuery({
        queryKey: ["notification-student-recipients", search, page, size],
        queryFn: async () => {
            requireToken();
            return await getStudentRecipients({search, page, size});
        },
        retry: false,
    });

export const useCreateScheduledNotification = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (body: CreateScheduledNotificationRequest) => createScheduledNotification(body),
        onSuccess: async () => {
            await qc.invalidateQueries({queryKey: ["scheduled-notifications"]});
        },
    });
};

export const useGetScheduledNotifications = ({
    status,
    page,
    size,
}: {
    status?: ScheduledNotificationStatus | "";
    page: number;
    size: number;
}) =>
    useQuery({
        queryKey: ["scheduled-notifications", status || "", page, size],
        queryFn: async () => {
            requireToken();
            return await getScheduledNotifications({status, page, size});
        },
        retry: false,
    });

export const useCancelScheduledNotification = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => cancelScheduledNotification(id),
        onSuccess: async () => {
            await qc.invalidateQueries({queryKey: ["scheduled-notifications"]});
        },
    });
};
