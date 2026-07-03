import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import * as Yup from "yup";
import PageMeta from "../../components/common/PageMeta";
import Label from "../../components/form/Label.tsx";
import Input from "../../components/form/input/InputField.tsx";
import ComponentCard from "../../components/common/ComponentCard.tsx";
import {useParams} from "react-router";
import {useAddRole, useGetRoleById, useUpdateRole} from "../../api/roles/useRole.ts";
import {useEffect, useState} from "react";
import {useFormik} from "formik";
import MultiSelect from "../../components/form/MultiSelect.tsx";
import Button from "../../components/ui/button/Button.tsx";
import {Role} from "../../types/types.ts";


export const permissionsOptions = [
    {value: "USER_CREATE", text: "Xodim yaratish"},
    {value: "USER_READ", text: "Xodimlarni ko‘rish"},
    {value: "USER_UPDATE", text: "Xodimni tahrirlash"},
    {value: "USER_DELETE", text: "Xodimni o‘chirish"},
    {value: "BUSINESS_CREATE", text: "Biznes yaratish"},
    {value: "BUSINESS_READ", text: "Bizneslarni ko‘rish"},
    {value: "BUSINESS_UPDATE", text: "Biznesni tahrirlash"},
    {value: "BUSINESS_DELETE", text: "Biznesni o‘chirish"},
    {value: "BUSINESS_APPROVE", text: "Biznesni tasdiqlash"},
    {value: "ASSISTANT_MANAGE", text: "Assistentlarni boshqarish"},
    {value: "TECHER_MANAGE", text: "O‘qituvchilarni boshqarish"},
    {value: "COURSE_CREATE", text: "Kurs yaratish"},
    {value: "COURSE_READ", text: "Kurslarni ko‘rish"},
    {value: "COURSE_UPDATE", text: "Kursni tahrirlash"},
    {value: "COURSE_DELETE", text: "Kursni o‘chirish"},
    {value: "MODULE_CREATE", text: "Modul yaratish"},
    {value: "MODULE_READ", text: "Modullarni ko‘rish"},
    {value: "MODULE_UPDATE", text: "Modulni tahrirlash"},
    {value: "MODULE_DELETE", text: "Modulni o‘chirish"},
    {value: "LESSON_MANAGE", text: "Darslarni boshqarish"},
    {value: "LESSON_READ", text: "Darslarni ko‘rish"},
    {value: "PAYMENT_CREATE", text: "To‘lov yaratish"},
    {value: "PAYMENT_READ", text: "To‘lovlarni ko‘rish"},
    {value: "PAYMENT_VERIFY", text: "To‘lovni tasdiqlash"},
    {value: "ADMIN_READ_STATS", text: "Statistikani ko‘rish"},
    {value: "ADMIN_MANAGE_USERS", text: "Xodimlarni boshqarish"},
    {value: "ADMIN_MANAGE_BUSINESSES", text: "Bizneslarni boshqarish"},
    {value: "ROLE_MANAGE", text: "Rollarni boshqarish"},
];
export default function AddRole() {

    const {id} = useParams<{ id: string }>();
    const {mutateAsync, isPending: isAdding} = useAddRole();
    const {mutateAsync: updateRole, isPending: isUpdating} = useUpdateRole();
    const {data} = useGetRoleById(id);

    const [initialValues, setInitialValues] = useState<Omit<Role, "id">>({
        name: "",
        permissions: []
    });

    useEffect(() => {
        if (data) {
            setInitialValues({
                name: data.name,
                permissions: data.permissions
            })
        }
    }, [data])


    const formik = useFormik({
        initialValues: initialValues,
        enableReinitialize: true,
        validationSchema: Yup.object().shape({
            name: Yup.string()
                .required("Nomini kiriting!"),
            permissions: Yup.array().min(1, "Kamida 1 ruxsat tanlanishi kerak")
        }),
        onSubmit: async (values) => {
            console.log(values);
            if (id) {
                await updateRole({...values, id});
            } else {
                await mutateAsync(values);
            }
        },
    });

    console.log(formik);

    return (
        <div>
            <PageMeta
                title="Lavozim yaratish"
                description="Lavozim yaratish"
            />
            <PageBreadcrumb pageTitle="Lavozim yaratish"/>
            <ComponentCard>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        formik.handleSubmit();
                        return false;
                    }}>
                    <div className="grid grid-cols-1 gap-6">
                        <div>
                            <Label htmlFor="name">Lavozim nomi</Label>
                            <Input type="text" formik={formik} name={'name'} placeholder={'Lavozim nomi'}/>
                        </div>
                        <div>
                            <MultiSelect placeholder={'Rollar'} value={formik.values.permissions}
                                         options={permissionsOptions} label={'Rollarni tanlang'}
                                         onChange={(e) => {
                                             console.log(e)
                                             formik.setFieldValue("permissions", e);
                                         }}
                                         errorMessage={formik.errors.permissions as string}
                            />
                        </div>
                    </div>
                    <div className={'mt-3 flex gap-6 justify-end'}>
                        <Button type="submit" variant='primary' isPending={isAdding || isUpdating}
                                disabled={isAdding || isUpdating}>
                            Saqlash
                        </Button>
                    </div>
                </form>

            </ComponentCard>
        </div>
    );
}
