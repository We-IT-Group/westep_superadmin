import {useEffect, useState} from "react";
import {useFormik} from "formik";
import * as Yup from "yup";
import {useParams} from "react-router";
import {useAddSubscriptionPlan, useGetSubscriptionPlanById, useUpdateSubscriptionPlan} from "../../api/subscriptionPlans/useSubscriptionPlan.ts";
import ComponentCard from "../../components/common/ComponentCard.tsx";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Label from "../../components/form/Label.tsx";
import Input from "../../components/form/input/InputField.tsx";
import StatusToast from "../../components/paymentSettings/StatusToast.tsx";
import Button from "../../components/ui/button/Button.tsx";
import Alert from "../../components/ui/alert/Alert";
import {SubscriptionPlanFormValues} from "../../types/types.ts";

const initialState: SubscriptionPlanFormValues = {
    name: "",
    slug: "",
    tier: 1,
    monthlyPrice: 0,
    description: "",
    featuresText: "",
};

function normalizeFeatures(featuresText: string) {
    return featuresText
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean);
}

export default function AddSubscriptionPlan() {
    const {id} = useParams<{ id: string }>();
    const {data} = useGetSubscriptionPlanById(id);
    const {mutateAsync: addSubscriptionPlan, isPending: isAdding} = useAddSubscriptionPlan();
    const {mutateAsync: updateSubscriptionPlan, isPending: isUpdating} = useUpdateSubscriptionPlan();
    const [initialValues, setInitialValues] = useState<SubscriptionPlanFormValues>(initialState);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

    useEffect(() => {
        if (data) {
            setInitialValues({
                name: data.name,
                slug: data.slug,
                tier: data.tier,
                monthlyPrice: data.monthlyPrice,
                description: data.description || "",
                featuresText: data.features.join("\n"),
            });
        }
    }, [data]);

    const formik = useFormik({
        initialValues,
        enableReinitialize: true,
        validationSchema: Yup.object({
            name: Yup.string().trim().required("Paket nomini kiriting"),
            slug: Yup.string().trim().required("Slug kiriting"),
            tier: Yup.number().min(1, "Tier kamida 1 bo'lishi kerak").required("Tier kiriting"),
            monthlyPrice: Yup.number().min(0, "Narx manfiy bo'lmasin").required("Narx kiriting"),
            description: Yup.string().trim().required("Tavsif kiriting"),
            featuresText: Yup.string().test(
                "has-features",
                "Kamida bitta feature kiriting",
                (value) => normalizeFeatures(value || "").length > 0,
            ),
        }),
        onSubmit: async (values) => {
            try {
                const payload = {
                    name: values.name.trim(),
                    slug: values.slug.trim(),
                    tier: Number(values.tier),
                    monthlyPrice: Number(values.monthlyPrice),
                    description: values.description.trim(),
                    features: normalizeFeatures(values.featuresText),
                };

                if (id) {
                    await updateSubscriptionPlan({
                        id,
                        ...payload,
                    });
                } else {
                    await addSubscriptionPlan(payload);
                }
            } catch (error) {
                setToast({
                    message: error instanceof Error ? error.message : "Obuna paketi saqlanmadi",
                    type: "error",
                });
            }
        },
    });

    return (
        <div>
            {toast && <StatusToast message={toast.message} type={toast.type} onClose={() => setToast(null)}/>}
            <PageMeta
                title={id ? "Obuna paketini tahrirlash" : "Obuna paketi qo'shish"}
                description="Subscription plan formasi"
            />
            <PageBreadcrumb pageTitle={id ? "Obuna paketini tahrirlash" : "Obuna paketi qo'shish"}/>
            <div className="space-y-6">
                <Alert
                    variant="info"
                    title="Scope"
                    message="Bu forma platform-level subscription package CRUD uchun. Student subscription orderlari va statistika nazorati keyingi admin endpointlar bilan ulanadi."
                />
                <ComponentCard title="Subscription plan">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            formik.handleSubmit();
                            return false;
                        }}
                    >
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                            <div>
                                <Label htmlFor="name">Paket nomi</Label>
                                <Input<SubscriptionPlanFormValues>
                                    type="text"
                                    formik={formik}
                                    name="name"
                                    placeholder="Premium"
                                />
                            </div>
                            <div>
                                <Label htmlFor="slug">Slug</Label>
                                <Input<SubscriptionPlanFormValues>
                                    type="text"
                                    formik={formik}
                                    name="slug"
                                    placeholder="premium"
                                />
                            </div>
                            <div>
                                <Label htmlFor="tier">Tier</Label>
                                <Input<SubscriptionPlanFormValues>
                                    type="number"
                                    formik={formik}
                                    name="tier"
                                    placeholder="2"
                                />
                            </div>
                            <div>
                                <Label htmlFor="monthlyPrice">Oylik narx</Label>
                                <Input<SubscriptionPlanFormValues>
                                    type="number"
                                    formik={formik}
                                    name="monthlyPrice"
                                    placeholder="100000"
                                />
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-1 gap-6">
                            <div>
                                <Label htmlFor="description">Tavsif</Label>
                                <textarea
                                    id="description"
                                    name="description"
                                    rows={4}
                                    value={formik.values.description}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                    placeholder="Barcha premium kurslarga oylik kirish"
                                />
                                {formik.touched.description && formik.errors.description ? (
                                    <p className="mt-1 text-sm text-red-500">{formik.errors.description}</p>
                                ) : null}
                            </div>

                            <div>
                                <Label htmlFor="featuresText">Featurelar</Label>
                                <textarea
                                    id="featuresText"
                                    name="featuresText"
                                    rows={6}
                                    value={formik.values.featuresText}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                    placeholder={`Premium kurslarni ko'rish\nOylik obuna\nMobil ilovada foydalanish`}
                                />
                                <p className="mt-1 text-sm text-gray-500">Har bir feature'ni yangi qatordan kiriting.</p>
                                {formik.touched.featuresText && formik.errors.featuresText ? (
                                    <p className="mt-1 text-sm text-red-500">{formik.errors.featuresText}</p>
                                ) : null}
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
        </div>
    );
}
