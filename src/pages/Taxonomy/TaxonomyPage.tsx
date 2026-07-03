import {useMemo, useState} from "react";
import {useFormik} from "formik";
import * as Yup from "yup";
import {ColumnDef} from "@tanstack/react-table";
import {PencilIcon, TrashBinIcon} from "../../icons";
import {Modal} from "../../components/ui/modal";
import Label from "../../components/form/Label.tsx";
import Button from "../../components/ui/button/Button.tsx";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import CommonTable from "../../components/tables/CommonTable/CommonTable.tsx";
import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import DeleteModal from "../../components/common/DeleteModal.tsx";
import StatusToast from "../../components/paymentSettings/StatusToast.tsx";
import {
    TaxonomyCategory,
    TaxonomyCategoryFormValues,
    TaxonomySkillTag,
    TaxonomySkillTagFormValues,
    TaxonomySubcategory,
    TaxonomySubcategoryFormValues
} from "../../types/types.ts";
import {
    useCreateCategory,
    useCreateSkillTag,
    useCreateSubcategory,
    useDeleteCategory,
    useDeleteSkillTag,
    useDeleteSubcategory,
    useGetCategories,
    useGetSkillTags,
    useGetSubcategories,
    useUpdateCategory,
    useUpdateSkillTag,
    useUpdateSubcategory
} from "../../api/taxonomy/useTaxonomy.ts";

function renderValue(value?: string | null) {
    return value && value.trim() ? value : "—";
}

function ErrorState({message}: { message: string }) {
    return (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
            {message}
        </div>
    );
}

function ActionButtons({
    onEdit,
    onDelete,
}: {
    onEdit: () => void;
    onDelete: () => void;
}) {
    return (
        <div className="flex items-center gap-3">
            <button onClick={onEdit} className="flex items-center text-green-600 hover:text-green-800" type="button">
                <PencilIcon className="text-2xl"/>
            </button>
            <button onClick={onDelete} className="text-red-600 hover:text-red-800 text-lg" type="button">
                <TrashBinIcon className="text-2xl"/>
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

function CategoryFormModal({
    isOpen,
    onClose,
    initialValues,
    title,
    isPending,
    onSubmit,
}: {
    isOpen: boolean;
    onClose: () => void;
    initialValues: TaxonomyCategoryFormValues;
    title: string;
    isPending: boolean;
    onSubmit: (values: TaxonomyCategoryFormValues) => Promise<void>;
}) {
    const [formError, setFormError] = useState("");
    const formik = useFormik({
        initialValues,
        enableReinitialize: true,
        validationSchema: Yup.object({
            name: Yup.string().trim().required("Kategoriya nomini kiriting"),
            description: Yup.string().trim(),
        }),
        onSubmit: async (values) => {
            setFormError("");
            try {
                await onSubmit({
                    name: values.name.trim(),
                    description: values.description.trim(),
                });
                onClose();
            } catch (error) {
                setFormError(error instanceof Error ? error.message : "Kategoriya saqlanmadi");
            }
        },
    });

    return (
        <FormModal isOpen={isOpen} onClose={onClose} title={title} description="Kategoriya ma'lumotlarini kiriting.">
            <form onSubmit={(e) => { e.preventDefault(); formik.handleSubmit(); }} className="space-y-5">
                {formError && <ErrorState message={formError}/>}
                <div>
                    <Label htmlFor="category-name">Nomi</Label>
                    <input
                        id="category-name"
                        name="name"
                        value={formik.values.name}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                    />
                    {formik.touched.name && formik.errors.name && <p className="mt-1.5 text-xs text-error-500">{formik.errors.name}</p>}
                </div>
                <div>
                    <Label htmlFor="category-description">Tavsif</Label>
                    <textarea
                        id="category-description"
                        name="description"
                        value={formik.values.description}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        rows={4}
                        className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                    />
                </div>
                <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={onClose}>Bekor qilish</Button>
                    <Button type="submit" isPending={isPending} disabled={isPending}>Saqlash</Button>
                </div>
            </form>
        </FormModal>
    );
}

function SubcategoryFormModal({
    isOpen,
    onClose,
    initialValues,
    title,
    isPending,
    onSubmit,
    categories,
}: {
    isOpen: boolean;
    onClose: () => void;
    initialValues: TaxonomySubcategoryFormValues;
    title: string;
    isPending: boolean;
    onSubmit: (values: TaxonomySubcategoryFormValues) => Promise<void>;
    categories: TaxonomyCategory[];
}) {
    const [formError, setFormError] = useState("");
    const formik = useFormik({
        initialValues,
        enableReinitialize: true,
        validationSchema: Yup.object({
            name: Yup.string().trim().required("Subkategoriya nomini kiriting"),
            description: Yup.string().trim(),
            categoryId: Yup.string().required("Kategoriya tanlang"),
        }),
        onSubmit: async (values) => {
            setFormError("");
            try {
                await onSubmit({
                    name: values.name.trim(),
                    description: values.description.trim(),
                    categoryId: values.categoryId,
                });
                onClose();
            } catch (error) {
                setFormError(error instanceof Error ? error.message : "Subkategoriya saqlanmadi");
            }
        },
    });

    return (
        <FormModal isOpen={isOpen} onClose={onClose} title={title} description="Subkategoriya ma'lumotlarini kiriting.">
            <form onSubmit={(e) => { e.preventDefault(); formik.handleSubmit(); }} className="space-y-5">
                {formError && <ErrorState message={formError}/>}
                <div>
                    <Label htmlFor="subcategory-name">Nomi</Label>
                    <input
                        id="subcategory-name"
                        name="name"
                        value={formik.values.name}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                    />
                    {formik.touched.name && formik.errors.name && <p className="mt-1.5 text-xs text-error-500">{formik.errors.name}</p>}
                </div>
                <div>
                    <Label htmlFor="subcategory-category">Kategoriya</Label>
                    <select
                        id="subcategory-category"
                        name="categoryId"
                        value={formik.values.categoryId}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                    >
                        <option value="">Kategoriya tanlang</option>
                        {categories.map((category) => (
                            <option key={category.id} value={category.id}>{category.name}</option>
                        ))}
                    </select>
                    {formik.touched.categoryId && formik.errors.categoryId && <p className="mt-1.5 text-xs text-error-500">{formik.errors.categoryId}</p>}
                </div>
                <div>
                    <Label htmlFor="subcategory-description">Tavsif</Label>
                    <textarea
                        id="subcategory-description"
                        name="description"
                        value={formik.values.description}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        rows={4}
                        className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                    />
                </div>
                <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={onClose}>Bekor qilish</Button>
                    <Button type="submit" isPending={isPending} disabled={isPending}>Saqlash</Button>
                </div>
            </form>
        </FormModal>
    );
}

function SkillTagFormModal({
    isOpen,
    onClose,
    initialValues,
    title,
    isPending,
    onSubmit,
}: {
    isOpen: boolean;
    onClose: () => void;
    initialValues: TaxonomySkillTagFormValues;
    title: string;
    isPending: boolean;
    onSubmit: (values: TaxonomySkillTagFormValues) => Promise<void>;
}) {
    const [formError, setFormError] = useState("");
    const formik = useFormik({
        initialValues,
        enableReinitialize: true,
        validationSchema: Yup.object({
            name: Yup.string().trim().required("Skill tag nomini kiriting"),
            description: Yup.string().trim(),
        }),
        onSubmit: async (values) => {
            setFormError("");
            try {
                await onSubmit({
                    name: values.name.trim(),
                    description: values.description.trim(),
                });
                onClose();
            } catch (error) {
                setFormError(error instanceof Error ? error.message : "Skill tag saqlanmadi");
            }
        },
    });

    return (
        <FormModal isOpen={isOpen} onClose={onClose} title={title} description="Skill tag ma'lumotlarini kiriting.">
            <form onSubmit={(e) => { e.preventDefault(); formik.handleSubmit(); }} className="space-y-5">
                {formError && <ErrorState message={formError}/>}
                <div>
                    <Label htmlFor="skilltag-name">Nomi</Label>
                    <input
                        id="skilltag-name"
                        name="name"
                        value={formik.values.name}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                    />
                    {formik.touched.name && formik.errors.name && <p className="mt-1.5 text-xs text-error-500">{formik.errors.name}</p>}
                </div>
                <div>
                    <Label htmlFor="skilltag-description">Tavsif</Label>
                    <textarea
                        id="skilltag-description"
                        name="description"
                        value={formik.values.description}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        rows={4}
                        className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                    />
                </div>
                <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={onClose}>Bekor qilish</Button>
                    <Button type="submit" isPending={isPending} disabled={isPending}>Saqlash</Button>
                </div>
            </form>
        </FormModal>
    );
}

export default function TaxonomyPage() {
    const {data: categories = [], isPending: categoriesPending, error: categoriesError} = useGetCategories();
    const [subcategoryFilter, setSubcategoryFilter] = useState("");
    const {data: subcategories = [], isPending: subcategoriesPending, error: subcategoriesError} = useGetSubcategories(subcategoryFilter || undefined);
    const [skillTagQuery, setSkillTagQuery] = useState("");
    const {data: skillTags = [], isPending: skillTagsPending, error: skillTagsError} = useGetSkillTags(skillTagQuery || undefined);

    const {mutateAsync: createCategory, isPending: createCategoryPending} = useCreateCategory();
    const {mutateAsync: updateCategory, isPending: updateCategoryPending} = useUpdateCategory();
    const {mutateAsync: deleteCategory, isPending: deleteCategoryPending} = useDeleteCategory();
    const {mutateAsync: createSubcategory, isPending: createSubcategoryPending} = useCreateSubcategory();
    const {mutateAsync: updateSubcategory, isPending: updateSubcategoryPending} = useUpdateSubcategory();
    const {mutateAsync: deleteSubcategory, isPending: deleteSubcategoryPending} = useDeleteSubcategory();
    const {mutateAsync: createSkillTag, isPending: createSkillTagPending} = useCreateSkillTag();
    const {mutateAsync: updateSkillTag, isPending: updateSkillTagPending} = useUpdateSkillTag();
    const {mutateAsync: deleteSkillTag, isPending: deleteSkillTagPending} = useDeleteSkillTag();

    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

    const [categoryModalOpen, setCategoryModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<TaxonomyCategory | null>(null);
    const [categoryDeleteId, setCategoryDeleteId] = useState<string | null>(null);

    const [subcategoryModalOpen, setSubcategoryModalOpen] = useState(false);
    const [editingSubcategory, setEditingSubcategory] = useState<TaxonomySubcategory | null>(null);
    const [subcategoryDeleteId, setSubcategoryDeleteId] = useState<string | null>(null);

    const [skillTagModalOpen, setSkillTagModalOpen] = useState(false);
    const [editingSkillTag, setEditingSkillTag] = useState<TaxonomySkillTag | null>(null);
    const [skillTagDeleteId, setSkillTagDeleteId] = useState<string | null>(null);

    const categoryColumns: ColumnDef<TaxonomyCategory>[] = useMemo(() => [
        {accessorKey: "name", header: "Nomi"},
        {
            accessorKey: "description",
            header: "Tavsif",
            cell: ({row}) => <div className="max-w-[360px] whitespace-normal break-words">{renderValue(row.original.description)}</div>,
        },
        {
            id: "actions",
            header: "",
            cell: ({row}) => (
                <ActionButtons
                    onEdit={() => {
                        setEditingCategory(row.original);
                        setCategoryModalOpen(true);
                    }}
                    onDelete={() => setCategoryDeleteId(row.original.id)}
                />
            ),
        },
    ], []);

    const subcategoryColumns: ColumnDef<TaxonomySubcategory>[] = useMemo(() => [
        {accessorKey: "name", header: "Nomi"},
        {accessorKey: "categoryName", header: "Kategoriya"},
        {
            accessorKey: "description",
            header: "Tavsif",
            cell: ({row}) => <div className="max-w-[360px] whitespace-normal break-words">{renderValue(row.original.description)}</div>,
        },
        {
            id: "actions",
            header: "",
            cell: ({row}) => (
                <ActionButtons
                    onEdit={() => {
                        setEditingSubcategory(row.original);
                        setSubcategoryModalOpen(true);
                    }}
                    onDelete={() => setSubcategoryDeleteId(row.original.id)}
                />
            ),
        },
    ], []);

    const skillTagColumns: ColumnDef<TaxonomySkillTag>[] = useMemo(() => [
        {accessorKey: "name", header: "Nomi"},
        {
            accessorKey: "description",
            header: "Tavsif",
            cell: ({row}) => <div className="max-w-[360px] whitespace-normal break-words">{renderValue(row.original.description)}</div>,
        },
        {
            id: "actions",
            header: "",
            cell: ({row}) => (
                <ActionButtons
                    onEdit={() => {
                        setEditingSkillTag(row.original);
                        setSkillTagModalOpen(true);
                    }}
                    onDelete={() => setSkillTagDeleteId(row.original.id)}
                />
            ),
        },
    ], []);

    const handleCategorySubmit = async (values: TaxonomyCategoryFormValues) => {
        if (editingCategory?.id) {
            await updateCategory({id: editingCategory.id, values});
            setToast({message: "Kategoriya yangilandi", type: "success"});
        } else {
            await createCategory(values);
            setToast({message: "Kategoriya yaratildi", type: "success"});
        }
        setEditingCategory(null);
    };

    const handleSubcategorySubmit = async (values: TaxonomySubcategoryFormValues) => {
        if (editingSubcategory?.id) {
            await updateSubcategory({id: editingSubcategory.id, values});
            setToast({message: "Subkategoriya yangilandi", type: "success"});
        } else {
            await createSubcategory(values);
            setToast({message: "Subkategoriya yaratildi", type: "success"});
        }
        setEditingSubcategory(null);
    };

    const handleSkillTagSubmit = async (values: TaxonomySkillTagFormValues) => {
        if (editingSkillTag?.id) {
            await updateSkillTag({id: editingSkillTag.id, values});
            setToast({message: "Skill tag yangilandi", type: "success"});
        } else {
            await createSkillTag(values);
            setToast({message: "Skill tag yaratildi", type: "success"});
        }
        setEditingSkillTag(null);
    };

    return (
        <>
            {toast && <StatusToast message={toast.message} type={toast.type} onClose={() => setToast(null)}/>}
            <PageMeta title="Taxonomy" description="Kategoriya, subkategoriya va skill tag boshqaruvi"/>
            <PageBreadcrumb pageTitle="Taxonomy"/>

            <div className="space-y-6">
                <ComponentCard title="Kategoriyalar" desc="Category CRUD boshqaruvi">
                    {categoriesError && <ErrorState message={categoriesError instanceof Error ? categoriesError.message : "Kategoriyalar yuklanmadi"}/>}
                    <div className="flex justify-end">
                        <Button size="sm" onClick={() => { setEditingCategory(null); setCategoryModalOpen(true); }}>
                            Kategoriya qo'shish
                        </Button>
                    </div>
                    <CommonTable data={categories} columns={categoryColumns} isPending={categoriesPending}/>
                </ComponentCard>

                <ComponentCard title="Subkategoriyalar" desc="Subcategory CRUD boshqaruvi">
                    {subcategoriesError && <ErrorState message={subcategoriesError instanceof Error ? subcategoriesError.message : "Subkategoriyalar yuklanmadi"}/>}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <select
                                value={subcategoryFilter}
                                onChange={(e) => setSubcategoryFilter(e.target.value)}
                                className="h-11 rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                            >
                                <option value="">Barcha kategoriyalar</option>
                                {categories.map((category) => (
                                    <option key={category.id} value={category.id}>{category.name}</option>
                                ))}
                            </select>
                        </div>
                        <Button size="sm" onClick={() => { setEditingSubcategory(null); setSubcategoryModalOpen(true); }}>
                            Subkategoriya qo'shish
                        </Button>
                    </div>
                    <CommonTable data={subcategories} columns={subcategoryColumns} isPending={subcategoriesPending}/>
                </ComponentCard>

                <ComponentCard title="Skill taglar" desc="Skill tag CRUD boshqaruvi">
                    {skillTagsError && <ErrorState message={skillTagsError instanceof Error ? skillTagsError.message : "Skill taglar yuklanmadi"}/>}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <input
                            value={skillTagQuery}
                            onChange={(e) => setSkillTagQuery(e.target.value)}
                            placeholder="Skill tag qidirish..."
                            className="h-11 min-w-[280px] rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                        />
                        <Button size="sm" onClick={() => { setEditingSkillTag(null); setSkillTagModalOpen(true); }}>
                            Skill tag qo'shish
                        </Button>
                    </div>
                    <CommonTable data={skillTags} columns={skillTagColumns} isPending={skillTagsPending}/>
                </ComponentCard>
            </div>

            <CategoryFormModal
                isOpen={categoryModalOpen}
                onClose={() => { setCategoryModalOpen(false); setEditingCategory(null); }}
                initialValues={{
                    name: editingCategory?.name || "",
                    description: editingCategory?.description || "",
                }}
                title={editingCategory ? "Kategoriyani tahrirlash" : "Kategoriya qo'shish"}
                isPending={createCategoryPending || updateCategoryPending}
                onSubmit={handleCategorySubmit}
            />

            <SubcategoryFormModal
                isOpen={subcategoryModalOpen}
                onClose={() => { setSubcategoryModalOpen(false); setEditingSubcategory(null); }}
                initialValues={{
                    name: editingSubcategory?.name || "",
                    description: editingSubcategory?.description || "",
                    categoryId: editingSubcategory?.categoryId || subcategoryFilter || "",
                }}
                title={editingSubcategory ? "Subkategoriyani tahrirlash" : "Subkategoriya qo'shish"}
                isPending={createSubcategoryPending || updateSubcategoryPending}
                onSubmit={handleSubcategorySubmit}
                categories={categories}
            />

            <SkillTagFormModal
                isOpen={skillTagModalOpen}
                onClose={() => { setSkillTagModalOpen(false); setEditingSkillTag(null); }}
                initialValues={{
                    name: editingSkillTag?.name || "",
                    description: editingSkillTag?.description || "",
                }}
                title={editingSkillTag ? "Skill tagni tahrirlash" : "Skill tag qo'shish"}
                isPending={createSkillTagPending || updateSkillTagPending}
                onSubmit={handleSkillTagSubmit}
            />

            <DeleteModal
                open={Boolean(categoryDeleteId)}
                setOpen={(open) => { if (!open) setCategoryDeleteId(null); }}
                isPending={deleteCategoryPending}
                deleteFunction={async () => {
                    if (!categoryDeleteId) return;
                    try {
                        await deleteCategory(categoryDeleteId);
                        setToast({message: "Kategoriya o'chirildi", type: "success"});
                    } catch (error) {
                        setToast({message: error instanceof Error ? error.message : "Kategoriya o'chmadi", type: "error"});
                    } finally {
                        setCategoryDeleteId(null);
                    }
                }}
            />

            <DeleteModal
                open={Boolean(subcategoryDeleteId)}
                setOpen={(open) => { if (!open) setSubcategoryDeleteId(null); }}
                isPending={deleteSubcategoryPending}
                deleteFunction={async () => {
                    if (!subcategoryDeleteId) return;
                    try {
                        await deleteSubcategory(subcategoryDeleteId);
                        setToast({message: "Subkategoriya o'chirildi", type: "success"});
                    } catch (error) {
                        setToast({message: error instanceof Error ? error.message : "Subkategoriya o'chmadi", type: "error"});
                    } finally {
                        setSubcategoryDeleteId(null);
                    }
                }}
            />

            <DeleteModal
                open={Boolean(skillTagDeleteId)}
                setOpen={(open) => { if (!open) setSkillTagDeleteId(null); }}
                isPending={deleteSkillTagPending}
                deleteFunction={async () => {
                    if (!skillTagDeleteId) return;
                    try {
                        await deleteSkillTag(skillTagDeleteId);
                        setToast({message: "Skill tag o'chirildi", type: "success"});
                    } catch (error) {
                        setToast({message: error instanceof Error ? error.message : "Skill tag o'chmadi", type: "error"});
                    } finally {
                        setSkillTagDeleteId(null);
                    }
                }}
            />
        </>
    );
}
