import {useMemo, useState} from "react";
import {useFormik} from "formik";
import * as Yup from "yup";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {Modal} from "../ui/modal";
import Label from "../form/Label.tsx";
import Button from "../ui/button/Button.tsx";
import StatusToast from "../paymentSettings/StatusToast.tsx";
import {Business, BusinessDomain, BusinessDomainFormValues} from "../../types/types.ts";
import {addBusinessDomain, deleteBusinessDomain, updateBusinessDomain} from "../../api/businessDomains/businessDomainApi.ts";

interface Props {
    business: Business | null;
    domain: BusinessDomain | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function BusinessDomainSettingsModal({business, domain, isOpen, onClose}: Props) {
    const qc = useQueryClient();
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

    const initialValues = useMemo<BusinessDomainFormValues>(() => ({
        businessId: business?.id || "",
        landingHost: domain?.landingHost || "",
        studentHost: domain?.studentHost || "",
        active: domain?.active ?? true,
    }), [business?.id, domain]);

    const createMutation = useMutation({
        mutationFn: addBusinessDomain,
        onSuccess: async () => {
            await qc.invalidateQueries({queryKey: ["business-domains"]});
        },
    });

    const updateMutation = useMutation({
        mutationFn: updateBusinessDomain,
        onSuccess: async () => {
            await qc.invalidateQueries({queryKey: ["business-domains"]});
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteBusinessDomain,
        onSuccess: async () => {
            await qc.invalidateQueries({queryKey: ["business-domains"]});
        },
    });

    const formik = useFormik({
        initialValues,
        enableReinitialize: true,
        validationSchema: Yup.object({
            landingHost: Yup.string().trim().required("Landing domain kiriting"),
            studentHost: Yup.string().trim().required("Student domain kiriting"),
            active: Yup.boolean().required(),
        }),
        onSubmit: async (values) => {
            try {
                if (domain?.id) {
                    await updateMutation.mutateAsync({...values, id: domain.id});
                    setToast({message: "Domain mapping yangilandi", type: "success"});
                } else {
                    await createMutation.mutateAsync(values);
                    setToast({message: "Domain mapping yaratildi", type: "success"});
                }
                onClose();
            } catch (error) {
                setToast({message: error instanceof Error ? error.message : "Domain mapping saqlanmadi", type: "error"});
            }
        },
    });

    const inputClassName =
        "h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs focus:outline-hidden focus:ring-3 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";

    const handleDelete = async () => {
        if (!domain?.id) return;
        try {
            await deleteMutation.mutateAsync(domain.id);
            setToast({message: "Domain mapping o'chirildi", type: "success"});
            onClose();
        } catch (error) {
            setToast({message: error instanceof Error ? error.message : "Domain mapping o'chmadi", type: "error"});
        }
    };

    return (
        <>
            {toast && <StatusToast message={toast.message} type={toast.type} onClose={() => setToast(null)}/>}
            <Modal isOpen={isOpen} onClose={onClose} className="max-w-[720px] m-4 p-6 sm:p-8">
                <div className="space-y-6">
                    <div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Domain sozlash: {business?.name}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Shu biznes uchun landing va student domenlarini biriktirasiz.
                        </p>
                    </div>

                    <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Tanlangan biznes</p>
                        <p className="mt-1 font-medium text-gray-900 dark:text-white">{business?.name || "—"}</p>
                    </div>

                    <form
                        className="space-y-5"
                        onSubmit={(e) => {
                            e.preventDefault();
                            formik.handleSubmit();
                        }}
                    >
                        <div>
                            <Label htmlFor="landingHost">Landing host</Label>
                            <input
                                id="landingHost"
                                name="landingHost"
                                value={formik.values.landingHost}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                placeholder="brainzone.westep.uz"
                                className={inputClassName}
                            />
                            {formik.touched.landingHost && formik.errors.landingHost && (
                                <p className="mt-1.5 text-xs text-error-500">{formik.errors.landingHost}</p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="studentHost">Student host</Label>
                            <input
                                id="studentHost"
                                name="studentHost"
                                value={formik.values.studentHost}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                placeholder="bz.westep.uz"
                                className={inputClassName}
                            />
                            {formik.touched.studentHost && formik.errors.studentHost && (
                                <p className="mt-1.5 text-xs text-error-500">{formik.errors.studentHost}</p>
                            )}
                        </div>

                        <label className="flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 dark:border-gray-800">
                            <input
                                type="checkbox"
                                checked={formik.values.active}
                                onChange={(e) => formik.setFieldValue("active", e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 text-brand-500"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">Faol</span>
                        </label>

                        <div className="flex justify-between gap-3">
                            <div>
                                {domain?.id && (
                                    <Button type="button" variant="danger" onClick={handleDelete} isPending={deleteMutation.isPending}>
                                        O'chirish
                                    </Button>
                                )}
                            </div>
                            <div className="flex gap-3">
                                <Button type="button" variant="outline" onClick={onClose}>
                                    Bekor qilish
                                </Button>
                                <Button type="submit" isPending={createMutation.isPending || updateMutation.isPending}>
                                    Saqlash
                                </Button>
                            </div>
                        </div>
                    </form>
                </div>
            </Modal>
        </>
    );
}
