import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import CommonTable from "../../components/tables/CommonTable/CommonTable.tsx";
import {useDeleteRole, useGetRoles} from "../../api/roles/useRole.ts";
import {ColumnDef} from "@tanstack/react-table";
import {Role} from '../../types/types.ts'
import Actions from "../../components/tables/Actions/Actions.tsx";
import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";

export default function BasicTables() {
    const {data, isPending} = useGetRoles()
    const {mutate, isPending: isDeletePending} = useDeleteRole()

    const handleDelete = async (id: string) => {
        await mutate(id)
    }

    const columns: ColumnDef<Role>[] = [{accessorKey: 'name', header: 'Nomi'},
        {
            id: 'actions',
            header: '',
            cell: ({row}) => <Actions isPending={isDeletePending} key={row.original.id} deleteFunction={handleDelete}
                                      id={row.original.id}/>,
        },
    ]

    return (
        <>
            <PageMeta
                title="Lavozimlar"
                description="Lavozimlar"
            />
            <PageBreadcrumb pageTitle="Lavozimlar" path={'/roles/add'}/>
            <div className="space-y-6">
                <ComponentCard title="Lavozimlar">
                    <CommonTable data={data} columns={columns} isPending={isPending}/>
                </ComponentCard>
            </div>
        </>
    );
}
