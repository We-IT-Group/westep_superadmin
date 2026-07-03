import {useQuery, useMutation, useQueryClient} from "@tanstack/react-query";
import {getAllRoles, addRole, updateRole, deleteRole, getRoleById} from "./roleApi.ts";
import {useNavigate} from "react-router";
import {getItem} from "../../utils/utils.ts";

export const useGetRoles = () =>
    useQuery({
        queryKey: ["roles"],
        queryFn: async () => {
            const token = getItem<string>('accessToken');
            if (!token) throw new Error("No token");
            return await getAllRoles();
        },
        retry: false,
    });

export const useGetRoleById = (id: string | undefined) =>
    useQuery({
        queryKey: ["role", id],
        queryFn: async () => {
            const token = getItem<string>('accessToken');
            if (!token) throw new Error("No token");
            return await getRoleById(id);
        },
        enabled: !!id,
        retry: false,
    });

export const useAddRole = () => {
    const navigate = useNavigate();
    const qc = useQueryClient();
    return useMutation({
        mutationFn: addRole,
        onSuccess: async () => {
            const roles = await getAllRoles();
            qc.setQueryData(["roles"], roles);
            navigate("/roles");
        },
        onError: (error) => {
            alert(error);
        },
    });
};

export const useUpdateRole = () => {
    const navigate = useNavigate();
    const qc = useQueryClient();
    return useMutation({
        mutationFn: updateRole,
        onSuccess: async () => {
            const roles = await getAllRoles();
            qc.setQueryData(["roles"], roles);
            navigate("/roles");
        },
        onError: (error) => {
            alert(error);
        },
    });
};

export const useDeleteRole = () => {
    const navigate = useNavigate();
    const qc = useQueryClient();
    return useMutation({
        mutationFn: deleteRole,
        onSuccess: async () => {
            const roles = await getAllRoles();
            qc.setQueryData(["roles"], roles);
            navigate("/roles");
        },
        onError: (error) => {
            alert(error);
        },
    });
};

