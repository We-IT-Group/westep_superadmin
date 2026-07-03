import {useMemo, useState} from "react";
import {useFormik} from "formik";
import * as Yup from "yup";
import {ColumnDef} from "@tanstack/react-table";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import DeleteModal from "../../components/common/DeleteModal.tsx";
import Label from "../../components/form/Label.tsx";
import StatusToast from "../../components/paymentSettings/StatusToast.tsx";
import CommonTable from "../../components/tables/CommonTable/CommonTable.tsx";
import Button from "../../components/ui/button/Button.tsx";
import {Modal} from "../../components/ui/modal";
import {PencilIcon, TrashBinIcon} from "../../icons";
import {
    useCreateAppLanguage,
    useCreateOrUpdateTranslation,
    useDeleteAppLanguage,
    useGetAdminAppLanguages,
    useGetAdminTranslations,
    useGetAppLanguages,
    useUpdateAppLanguage
} from "../../api/appTranslations/useAppTranslation.ts";
import {
    AppLanguage,
    AppLanguageFormValues,
    TranslationFilters,
    TranslationFormValues,
    TranslationItem
} from "../../types/types.ts";

function ErrorState({message}: { message: string }) {
    return (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
            {message}
        </div>
    );
}

function ActionButtons({
    onEdit,
}: {
    onEdit: () => void;
}) {
    return (
        <div className="flex items-center gap-3">
            <button onClick={onEdit} className="flex items-center text-green-600 hover:text-green-800" type="button">
                <PencilIcon className="text-2xl"/>
            </button>
        </div>
    );
}

function FormModal({
    isOpen,
    onClose,
    title,
    description,
    children,
}: {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    description: string;
    children: React.ReactNode;
}) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-[760px] m-4 p-6 sm:p-8">
            <div className="space-y-6">
                <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>
                </div>
                {children}
            </div>
        </Modal>
    );
}

function AppLanguageFormModal({
    isOpen,
    onClose,
    isPending,
    onSubmit,
    initialValues,
    mode,
}: {
    isOpen: boolean;
    onClose: () => void;
    isPending: boolean;
    onSubmit: (values: AppLanguageFormValues) => Promise<void>;
    initialValues: AppLanguageFormValues;
    mode: "create" | "edit";
}) {
    const [formError, setFormError] = useState("");
    const formik = useFormik<AppLanguageFormValues>({
        initialValues,
        enableReinitialize: true,
        validationSchema: Yup.object({
            name: Yup.string().trim().required("Til nomini kiriting"),
            code: Yup.string().trim().required("Til kodini kiriting"),
            defaultLanguage: Yup.boolean().required(),
            active: Yup.boolean().required(),
        }),
        onSubmit: async (values, helpers) => {
            setFormError("");
            try {
                await onSubmit({
                    name: values.name.trim(),
                    code: values.code.trim(),
                    defaultLanguage: values.defaultLanguage,
                    active: values.active,
                });
                helpers.resetForm();
                onClose();
            } catch (error) {
                setFormError(error instanceof Error ? error.message : "Til saqlanmadi");
            }
        },
    });

    const isEdit = mode === "edit";
    const defaultLocked = isEdit && initialValues.defaultLanguage;
    const activeLocked = isEdit && initialValues.defaultLanguage;

    return (
        <FormModal
            isOpen={isOpen}
            onClose={onClose}
            title={isEdit ? "Ilova tilini tahrirlash" : "Ilova tili qo'shish"}
            description={isEdit ? "Til ma'lumotlarini yangilang." : "Yangi til kodi va nomini kiriting."}
        >
            <form onSubmit={(e) => { e.preventDefault(); formik.handleSubmit(); }} className="space-y-5">
                {formError && <ErrorState message={formError}/>}
                <div>
                    <Label htmlFor="app-language-name">Til nomi</Label>
                    <input
                        id="app-language-name"
                        name="name"
                        value={formik.values.name}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                        placeholder="English"
                    />
                </div>
                <div>
                    <Label htmlFor="app-language-code">Til kodi</Label>
                    <input
                        id="app-language-code"
                        name="code"
                        value={formik.values.code}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                        placeholder="en"
                    />
                </div>
                <label className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                    <input
                        type="checkbox"
                        name="defaultLanguage"
                        checked={formik.values.defaultLanguage}
                        onChange={formik.handleChange}
                        disabled={defaultLocked}
                    />
                    Default til
                    {defaultLocked && (
                        <span className="text-xs text-gray-400">(joriy default tilni bekor qilish uchun boshqa tilni default qiling)</span>
                    )}
                </label>
                <label className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                    <input
                        type="checkbox"
                        name="active"
                        checked={formik.values.active}
                        onChange={formik.handleChange}
                        disabled={activeLocked}
                    />
                    Faol
                    {activeLocked && (
                        <span className="text-xs text-gray-400">(default til doim faol bo'lishi kerak)</span>
                    )}
                </label>
                <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={onClose}>Bekor qilish</Button>
                    <Button type="submit" isPending={isPending} disabled={isPending}>Saqlash</Button>
                </div>
            </form>
        </FormModal>
    );
}

function TranslationFormModal({
    isOpen,
    onClose,
    languages,
    initialValues,
    isPending,
    onSubmit,
}: {
    isOpen: boolean;
    onClose: () => void;
    languages: AppLanguage[];
    initialValues: TranslationFormValues;
    isPending: boolean;
    onSubmit: (values: TranslationFormValues) => Promise<void>;
}) {
    const [formError, setFormError] = useState("");
    const formik = useFormik<TranslationFormValues>({
        initialValues,
        enableReinitialize: true,
        validationSchema: Yup.object({
            languageId: Yup.string().required("Til tanlang"),
            namespace: Yup.string().trim().required("Namespace kiriting"),
            key: Yup.string().trim().required("Key kiriting"),
            value: Yup.string().trim().required("Value kiriting"),
            description: Yup.string().trim(),
            active: Yup.boolean().required(),
        }),
        onSubmit: async (values) => {
            setFormError("");
            try {
                await onSubmit({
                    languageId: values.languageId,
                    namespace: values.namespace.trim(),
                    key: values.key.trim(),
                    value: values.value.trim(),
                    description: values.description.trim(),
                    active: values.active,
                });
                onClose();
            } catch (error) {
                setFormError(error instanceof Error ? error.message : "Tarjima saqlanmadi");
            }
        },
    });

    return (
        <FormModal isOpen={isOpen} onClose={onClose} title="Tarjima saqlash" description="Namespace, key va value bo'yicha tarjima kiriting yoki yangilang.">
            <form onSubmit={(e) => { e.preventDefault(); formik.handleSubmit(); }} className="space-y-5">
                {formError && <ErrorState message={formError}/>}
                <div>
                    <Label htmlFor="translation-language">Til</Label>
                    <select
                        id="translation-language"
                        name="languageId"
                        value={formik.values.languageId}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                    >
                        <option value="">Til tanlang</option>
                        {languages.map((language) => (
                            <option key={language.id} value={language.id}>{language.name} ({language.code})</option>
                        ))}
                    </select>
                </div>
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                    <div>
                        <Label htmlFor="translation-namespace">Namespace</Label>
                        <input
                            id="translation-namespace"
                            name="namespace"
                            value={formik.values.namespace}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                            placeholder="auth"
                        />
                    </div>
                    <div>
                        <Label htmlFor="translation-key">Key</Label>
                        <input
                            id="translation-key"
                            name="key"
                            value={formik.values.key}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                            placeholder="login.title"
                        />
                    </div>
                </div>
                <div>
                    <Label htmlFor="translation-value">Value</Label>
                    <textarea
                        id="translation-value"
                        name="value"
                        value={formik.values.value}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        rows={4}
                        className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                        placeholder="Kirish"
                    />
                </div>
                <div>
                    <Label htmlFor="translation-description">Tavsif</Label>
                    <textarea
                        id="translation-description"
                        name="description"
                        value={formik.values.description}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        rows={3}
                        className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                        placeholder="Login sahifasi title"
                    />
                </div>
                <label className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                    <input
                        type="checkbox"
                        name="active"
                        checked={formik.values.active}
                        onChange={formik.handleChange}
                    />
                    Faol
                </label>
                <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={onClose}>Bekor qilish</Button>
                    <Button type="submit" isPending={isPending} disabled={isPending}>Saqlash</Button>
                </div>
            </form>
        </FormModal>
    );
}

const initialTranslationValues: TranslationFormValues = {
    languageId: "",
    namespace: "",
    key: "",
    value: "",
    description: "",
    active: true,
};

const emptyLanguageValues: AppLanguageFormValues = {
    name: "",
    code: "",
    defaultLanguage: false,
    active: true,
};

export default function AppTranslationsPage() {
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
    const [languageModalOpen, setLanguageModalOpen] = useState(false);
    const [editingLanguage, setEditingLanguage] = useState<AppLanguage | null>(null);
    const [deletingLanguage, setDeletingLanguage] = useState<AppLanguage | null>(null);
    const [translationModalOpen, setTranslationModalOpen] = useState(false);
    const [editingTranslation, setEditingTranslation] = useState<TranslationItem | null>(null);
    const [filters, setFilters] = useState<TranslationFilters>({
        languageId: "",
        namespace: "",
        q: "",
        page: 0,
        size: 20,
    });

    const {data: publicLanguages = []} = useGetAppLanguages();
    const {
        data: languages = [],
        isPending: languagesPending,
        error: languagesError,
    } = useGetAdminAppLanguages();
    const {
        data: translationsResponse,
        isPending: translationsPending,
        error: translationsError,
    } = useGetAdminTranslations(filters);
    const {mutateAsync: createLanguage, isPending: createLanguagePending} = useCreateAppLanguage();
    const {mutateAsync: updateLanguage, isPending: updateLanguagePending} = useUpdateAppLanguage();
    const {mutateAsync: deleteLanguage, isPending: deleteLanguagePending} = useDeleteAppLanguage();
    const {mutateAsync: saveTranslation, isPending: saveTranslationPending} = useCreateOrUpdateTranslation();

    const translationItems = translationsResponse?.items || [];
    const translationLanguages = publicLanguages.length ? publicLanguages : languages.filter((language) => language.active);

    const languageColumns: ColumnDef<AppLanguage>[] = useMemo(() => [
        {accessorKey: "name", header: "Til"},
        {accessorKey: "code", header: "Kod"},
        {
            accessorKey: "defaultLanguage",
            header: "Default",
            cell: ({row}) => row.original.defaultLanguage ? "Ha" : "Yo'q",
        },
        {
            accessorKey: "active",
            header: "Holat",
            cell: ({row}) => (
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                    row.original.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                }`}>
                    {row.original.active ? "Faol" : "Nofaol"}
                </span>
            ),
        },
        {
            id: "actions",
            header: "",
            cell: ({row}) => (
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => {
                            setEditingLanguage(row.original);
                            setLanguageModalOpen(true);
                        }}
                        className="flex items-center text-green-600 hover:text-green-800"
                    >
                        <PencilIcon className="text-2xl"/>
                    </button>
                    <button
                        type="button"
                        onClick={() => setDeletingLanguage(row.original)}
                        disabled={row.original.defaultLanguage || languages.length <= 1}
                        className="flex items-center text-red-600 hover:text-red-800 disabled:cursor-not-allowed disabled:text-gray-300"
                        title={
                            row.original.defaultLanguage
                                ? "Default tilni o'chirib bo'lmaydi"
                                : languages.length <= 1
                                    ? "Oxirgi tilni o'chirib bo'lmaydi"
                                    : undefined
                        }
                    >
                        <TrashBinIcon className="text-2xl"/>
                    </button>
                </div>
            ),
        },
    ], [languages.length]);

    const translationColumns: ColumnDef<TranslationItem>[] = useMemo(() => [
        {accessorKey: "languageCode", header: "Til"},
        {accessorKey: "namespace", header: "Namespace"},
        {accessorKey: "key", header: "Key"},
        {
            accessorKey: "value",
            header: "Value",
            cell: ({row}) => <div className="max-w-[320px] whitespace-normal break-words">{row.original.value}</div>,
        },
        {
            accessorKey: "description",
            header: "Tavsif",
            cell: ({row}) => <div className="max-w-[260px] whitespace-normal break-words">{row.original.description || "—"}</div>,
        },
        {
            id: "actions",
            header: "",
            cell: ({row}) => (
                <ActionButtons
                    onEdit={() => {
                        setEditingTranslation(row.original);
                        setTranslationModalOpen(true);
                    }}
                />
            ),
        },
    ], []);

    const handleSaveLanguage = async (values: AppLanguageFormValues) => {
        if (editingLanguage) {
            await updateLanguage({id: editingLanguage.id, ...values});
            setToast({message: "Ilova tili yangilandi", type: "success"});
        } else {
            await createLanguage(values);
            setToast({message: "Ilova tili yaratildi", type: "success"});
        }
        setEditingLanguage(null);
    };

    const handleDeleteLanguage = async () => {
        if (!deletingLanguage) return;
        try {
            await deleteLanguage(deletingLanguage.id);
            setToast({message: "Ilova tili o'chirildi", type: "success"});
            if (filters.languageId === deletingLanguage.id) {
                setFilters((prev) => ({...prev, languageId: "", page: 0}));
            }
            setDeletingLanguage(null);
        } catch (error) {
            setToast({message: error instanceof Error ? error.message : "Til o'chmadi", type: "error"});
        }
    };

    const handleSaveTranslation = async (values: TranslationFormValues) => {
        await saveTranslation(values);
        setToast({message: editingTranslation ? "Tarjima yangilandi" : "Tarjima saqlandi", type: "success"});
        setEditingTranslation(null);
    };

    return (
        <>
            {toast && <StatusToast message={toast.message} type={toast.type} onClose={() => setToast(null)}/>}
            <PageMeta title="Ilova tillari va tarjimalar" description="App language va translation boshqaruvi"/>
            <PageBreadcrumb pageTitle="Ilova tillari va tarjimalar"/>

            <div className="space-y-6">
                <ComponentCard title="Ilova tillari" desc="Barcha tillar ro'yxati. Kurslar uchun ham, ilova tarjimasi uchun ham aynan shu tillar ishlatiladi.">
                    {languagesError && <ErrorState message={languagesError instanceof Error ? languagesError.message : "Tillar yuklanmadi"}/>}
                    <div className="flex justify-end">
                        <Button
                            size="sm"
                            onClick={() => {
                                setEditingLanguage(null);
                                setLanguageModalOpen(true);
                            }}
                        >
                            Til qo'shish
                        </Button>
                    </div>
                    <CommonTable data={languages} columns={languageColumns} isPending={languagesPending}/>
                </ComponentCard>

                <ComponentCard title="Tarjimalar" desc="Namespace + key + value ko'rinishidagi tarjimalarni boshqarish">
                    {translationsError && <ErrorState message={translationsError instanceof Error ? translationsError.message : "Tarjimalar yuklanmadi"}/>}
                    <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
                        <div>
                            <Label htmlFor="translation-filter-language">Til</Label>
                            <select
                                id="translation-filter-language"
                                value={filters.languageId || ""}
                                onChange={(e) => setFilters((prev) => ({...prev, languageId: e.target.value, page: 0}))}
                                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                            >
                                <option value="">Til tanlang</option>
                                {translationLanguages.map((language) => (
                                    <option key={language.id} value={language.id}>{language.name} ({language.code})</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <Label htmlFor="translation-filter-namespace">Namespace</Label>
                            <input
                                id="translation-filter-namespace"
                                value={filters.namespace || ""}
                                onChange={(e) => setFilters((prev) => ({...prev, namespace: e.target.value, page: 0}))}
                                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                                placeholder="auth"
                            />
                        </div>
                        <div>
                            <Label htmlFor="translation-filter-q">Qidiruv</Label>
                            <input
                                id="translation-filter-q"
                                value={filters.q || ""}
                                onChange={(e) => setFilters((prev) => ({...prev, q: e.target.value, page: 0}))}
                                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                                placeholder="login"
                            />
                        </div>
                        <div className="flex items-end justify-end">
                            <Button
                                size="sm"
                                onClick={() => {
                                    setEditingTranslation(null);
                                    setTranslationModalOpen(true);
                                }}
                            >
                                Tarjima qo'shish
                            </Button>
                        </div>
                    </div>

                    {!filters.languageId ? (
                        <div className="rounded-xl border border-dashed border-gray-300 px-4 py-6 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
                            Tarjimalarni ko'rish uchun avval til tanlang.
                        </div>
                    ) : (
                        <>
                            <CommonTable data={translationItems} columns={translationColumns} isPending={translationsPending}/>
                            <div className="flex items-center justify-between gap-3">
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Jami: {translationsResponse?.totalItems || 0} ta, sahifa {translationsResponse ? translationsResponse.page + 1 : 1} / {translationsResponse?.totalPages || 1}
                                </p>
                                <div className="flex items-center gap-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        disabled={!translationsResponse || translationsResponse.page === 0}
                                        onClick={() => setFilters((prev) => ({...prev, page: Math.max(prev.page - 1, 0)}))}
                                    >
                                        Oldingi
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        disabled={!translationsResponse || translationsResponse.page + 1 >= translationsResponse.totalPages}
                                        onClick={() => setFilters((prev) => ({...prev, page: prev.page + 1}))}
                                    >
                                        Keyingi
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </ComponentCard>
            </div>

            <AppLanguageFormModal
                isOpen={languageModalOpen}
                onClose={() => {
                    setLanguageModalOpen(false);
                    setEditingLanguage(null);
                }}
                isPending={createLanguagePending || updateLanguagePending}
                onSubmit={handleSaveLanguage}
                mode={editingLanguage ? "edit" : "create"}
                initialValues={editingLanguage ? {
                    name: editingLanguage.name,
                    code: editingLanguage.code,
                    defaultLanguage: editingLanguage.defaultLanguage,
                    active: editingLanguage.active,
                } : emptyLanguageValues}
            />

            <DeleteModal
                open={Boolean(deletingLanguage)}
                setOpen={(open) => {
                    if (!open) setDeletingLanguage(null);
                }}
                deleteFunction={handleDeleteLanguage}
                isPending={deleteLanguagePending}
            />

            <TranslationFormModal
                isOpen={translationModalOpen}
                onClose={() => {
                    setTranslationModalOpen(false);
                    setEditingTranslation(null);
                }}
                languages={translationLanguages}
                initialValues={editingTranslation ? {
                    languageId: editingTranslation.languageId,
                    namespace: editingTranslation.namespace,
                    key: editingTranslation.key,
                    value: editingTranslation.value,
                    description: editingTranslation.description || "",
                    active: editingTranslation.active,
                } : {
                    ...initialTranslationValues,
                    languageId: filters.languageId || "",
                }}
                isPending={saveTranslationPending}
                onSubmit={handleSaveTranslation}
            />
        </>
    );
}
