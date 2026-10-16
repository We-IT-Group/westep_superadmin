import {useQuery} from "@tanstack/react-query";
import {
    getStudent,
    getStudentStats,
    getStudents,
    StudentListFilters,
} from "./studentApi.ts";

export const useStudentStats = () =>
    useQuery({
        queryKey: ["admin-students-stats"],
        queryFn: getStudentStats,
        retry: false,
    });

export const useStudents = (filters: StudentListFilters) =>
    useQuery({
        queryKey: ["admin-students", filters],
        queryFn: () => getStudents(filters),
        retry: false,
    });

export const useStudent = (id: string | undefined) =>
    useQuery({
        queryKey: ["admin-student", id],
        queryFn: () => getStudent(id as string),
        enabled: Boolean(id),
        retry: false,
    });
