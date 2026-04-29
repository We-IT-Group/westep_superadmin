import {useEffect, useState} from "react";
import {useFormik} from "formik";
import * as Yup from "yup";
import {useParams} from "react-router";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Label from "../../components/form/Label.tsx";
import Input from "../../components/form/input/InputField.tsx";
import ComponentCard from "../../components/common/ComponentCard.tsx";
import Button from "../../components/ui/button/Button.tsx";
import StatusToast from "../../components/paymentSettings/StatusToast.tsx";
import {CourseLanguageFormValues} from "../../types/types.ts";
import {useAddCourseLanguage, useGetCourseLanguageById, useUpdateCourseLanguage} from "../../api/courseLanguages/useCourseLanguage.ts";

const initialState: CourseLanguageFormValues = {
    name: "",
    code: "",
};

export default function AddCourseLanguage() {
    const {id} = useParams<{ id: string }>();
    const {data} = useGetCourseLanguageById(id);
    const {mutateAsync: addCourseLanguage, isPending: isAdding} = useAddCourseLanguage();
    const {mutateAsync: updateCourseLanguage, isPending: isUpdating} = useUpdateCourseLanguage();
    const [initialValues, setInitialValues] = useState<CourseLanguageFormValues>(initialState);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

    useEffect(() => {
        if (data) {
            setInitialValues({
                name: data.name,
                code: data.code,
            });
        }
    }, [data]);

    const formik = useFormik({
        initialValues,
        enableReinitialize: true,
        validationSchema: Yup.object({
            name: Yup.string().trim().required("Til nomini kiriting"),
            code: Yup.string().trim().required("Til kodini kiriting"),
        }),
        onSubmit: async (values) => {
            try {
                if (id) {
                    await updateCourseLanguage({
                        id,
                        name: values.name.trim(),
                        code: values.code.trim(),
                    });
                } else {
                    await addCourseLanguage({
                        name: values.name.trim(),
                        code: values.code.trim(),
                    });
                }
            } catch (error) {
                setToast({
                    message: error instanceof Error ? error.message : "Kurs tili saqlanmadi",
                    type: "error",
                });
            }
        },
    });

    return (
        <div>
            {toast && <StatusToast message={toast.message} type={toast.type} onClose={() => setToast(null)}/>}
            <PageMeta title={id ? "Kurs tilini tahrirlash" : "Kurs tili qo'shish"} description="Kurs tili formasi"/>
            <PageBreadcrumb pageTitle={id ? "Kurs tilini tahrirlash" : "Kurs tili qo'shish"}/>
            <ComponentCard title="Kurs tili">
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        formik.handleSubmit();
                        return false;
                    }}
                >
                    <div className="grid grid-cols-1 gap-6">
                        <div>
                            <Label htmlFor="name">Til nomi</Label>
                            <Input<CourseLanguageFormValues>
                                type="text"
                                formik={formik}
                                name="name"
                                placeholder="Masalan, O'zbek tili"
                            />
                        </div>
                        <div>
                            <Label htmlFor="code">Til kodi</Label>
                            <Input<CourseLanguageFormValues>
                                type="text"
                                formik={formik}
                                name="code"
                                placeholder="uz"
                            />
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end">
                        <Button
                            type="submit"
                            variant="primary"
                            isPending={isAdding || isUpdating}
                            disabled={isAdding || isUpdating}
                        >
                            Saqlash
                        </Button>
                    </div>
                </form>
            </ComponentCard>
        </div>
    );
}
