import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import * as Yup from "yup";
import PageMeta from "../../components/common/PageMeta";
import Label from "../../components/form/Label.tsx";
import Input from "../../components/form/input/InputField.tsx";
import ComponentCard from "../../components/common/ComponentCard.tsx";
import {useParams} from "react-router";
import {useEffect, useMemo, useState} from "react";
import {useFormik} from "formik";
import Button from "../../components/ui/button/Button.tsx";
import {BusinessDomainFormValues} from "../../types/types.ts";
import {useGetBusinesses} from "../../api/business/useBusiness.ts";
import {
    useAddBusinessDomain,
    useGetBusinessDomainById,
    useUpdateBusinessDomain
} from "../../api/businessDomains/useBusinessDomain.ts";

const initialState: BusinessDomainFormValues = {
    businessId: "",
    landingHost: "",
    studentHost: "",
    active: true,
};

export default function AddBusinessDomain() {
    const {id} = useParams<{ id: string }>();
    const {data: domainData} = useGetBusinessDomainById(id);
    const {data: businesses = [], isPending: isBusinessesPending} = useGetBusinesses();
    const {mutateAsync: addDomain, isPending: isAdding} = useAddBusinessDomain();
    const {mutateAsync: updateDomain, isPending: isUpdating} = useUpdateBusinessDomain();
    const [initialValues, setInitialValues] = useState<BusinessDomainFormValues>(initialState);

    useEffect(() => {
        if (domainData) {
            setInitialValues({
                businessId: domainData.businessId,
                landingHost: domainData.landingHost,
                studentHost: domainData.studentHost,
                active: domainData.active,
            });
        }
    }, [domainData]);

    const businessOptions = useMemo(
        () => businesses.map((business) => ({value: business.id, label: business.name})),
        [businesses],
    );

    const formik = useFormik({
        initialValues,
        enableReinitialize: true,
        validationSchema: Yup.object({
            businessId: Yup.string().required("Biznes tanlang"),
            landingHost: Yup.string().trim().required("Landing domainni kiriting"),
            studentHost: Yup.string().trim().required("Student domainni kiriting"),
            active: Yup.boolean().required(),
        }),
        onSubmit: async (values) => {
            if (id) {
                await updateDomain({...values, id});
            } else {
                await addDomain(values);
            }
        },
    });

    return (
        <div>
            <PageMeta title="Biznes domeni" description="Biznes va domen bog'lash"/>
            <PageBreadcrumb pageTitle={id ? "Biznes domenini tahrirlash" : "Biznes domenini qo'shish"}/>
            <ComponentCard title="Domen bog'lash">
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        formik.handleSubmit();
                        return false;
                    }}
                >
                    <div className="grid grid-cols-1 gap-6">
                        <div>
                            <Label htmlFor="businessId">Biznes</Label>
                            <select
                                id="businessId"
                                name="businessId"
                                value={formik.values.businessId}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                disabled={isBusinessesPending}
                                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs focus:outline-hidden focus:ring-3 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                            >
                                <option value="">Biznes tanlang</option>
                                {businessOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            {formik.touched.businessId && formik.errors.businessId && (
                                <p className="mt-1.5 text-xs text-error-500">{formik.errors.businessId}</p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="landingHost">Landing domain</Label>
                            <Input<BusinessDomainFormValues>
                                type="text"
                                formik={formik}
                                name="landingHost"
                                placeholder="brainzone.westep.uz"
                            />
                        </div>

                        <div>
                            <Label htmlFor="studentHost">Student domain</Label>
                            <Input<BusinessDomainFormValues>
                                type="text"
                                formik={formik}
                                name="studentHost"
                                placeholder="bz.westep.uz"
                            />
                        </div>

                        <label className="flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 dark:border-gray-800">
                            <input
                                type="checkbox"
                                name="active"
                                checked={formik.values.active}
                                onChange={(e) => formik.setFieldValue("active", e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">Faol holatda saqlash</span>
                        </label>
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
