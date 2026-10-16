import {useMemo, useState} from "react";
import {ColumnDef} from "@tanstack/react-table";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import CommonTable from "../../components/tables/CommonTable/CommonTable.tsx";
import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import Button from "../../components/ui/button/Button.tsx";
import {Modal} from "../../components/ui/modal";
import StatusToast from "../../components/paymentSettings/StatusToast.tsx";
import {
    AgeGroupValue,
    InterestQuizOptionPayload,
    InterestQuizQuestionItem,
} from "../../api/interestQuiz/interestQuizApi.ts";
import {
    useCreateInterestQuizQuestion,
    useDeleteInterestQuizQuestion,
    useGetInterestQuizQuestions,
    useGetProfessionFields,
    useUpdateInterestQuizQuestion,
} from "../../api/interestQuiz/useInterestQuiz.ts";

const AGE_GROUPS: Array<{ value: AgeGroupValue; label: string }> = [
    {value: "KIDS_5_8", label: "5–8 yosh"},
    {value: "JUNIOR_9_12", label: "9–12 yosh"},
    {value: "TEEN_13_17", label: "13–17 yosh"},
];

const ageLabel = (value: string) => AGE_GROUPS.find((g) => g.value === value)?.label || value;

interface OptionDraft {
    text: string;
    emoji: string;
    fieldWeights: Record<string, number>;
}

interface QuestionDraft {
    id?: string;
    text: string;
    ageGroup: AgeGroupValue;
    active: boolean;
    options: OptionDraft[];
}

const emptyOption = (): OptionDraft => ({text: "", emoji: "", fieldWeights: {}});

const emptyDraft = (): QuestionDraft => ({
    text: "",
    ageGroup: "KIDS_5_8",
    active: true,
    options: [emptyOption(), emptyOption()],
});

export default function InterestQuizQuestionsPage() {
    const [ageFilter, setAgeFilter] = useState<string>("");
    const [draft, setDraft] = useState<QuestionDraft | null>(null);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

    const {data: questions = [], isPending} = useGetInterestQuizQuestions();
    const {data: fields = []} = useGetProfessionFields();
    const {mutateAsync: createQuestion, isPending: isCreating} = useCreateInterestQuizQuestion();
    const {mutateAsync: updateQuestion, isPending: isUpdating} = useUpdateInterestQuizQuestion();
    const {mutateAsync: deleteQuestion} = useDeleteInterestQuizQuestion();

    const filtered = useMemo(
        () => questions.filter((q) => !ageFilter || q.ageGroup === ageFilter),
        [questions, ageFilter],
    );

    const openEdit = (question: InterestQuizQuestionItem) => {
        setDraft({
            id: question.id,
            text: question.text,
            ageGroup: question.ageGroup,
            active: question.active !== false,
            options: question.options.map((option) => ({
                text: option.text,
                emoji: option.emoji || "",
                fieldWeights: {...option.fieldWeights},
            })),
        });
    };

    const handleSave = async () => {
        if (!draft) return;
        if (!draft.text.trim()) {
            setToast({message: "Savol matnini kiriting", type: "error"});
            return;
        }
        const options: InterestQuizOptionPayload[] = draft.options
            .filter((option) => option.text.trim())
            .map((option, index) => ({
                text: option.text.trim(),
                emoji: option.emoji.trim() || null,
                orderIndex: index,
                fieldWeights: Object.fromEntries(
                    Object.entries(option.fieldWeights).filter(([, weight]) => weight > 0),
                ),
            }));
        if (options.length < 2) {
            setToast({message: "Kamida 2 ta variant kiriting", type: "error"});
            return;
        }
        if (options.some((option) => Object.keys(option.fieldWeights).length === 0)) {
            setToast({message: "Har bir variant kamida bitta yo'nalishga ball berishi kerak", type: "error"});
            return;
        }
        try {
            const body = {
                text: draft.text.trim(),
                ageGroup: draft.ageGroup,
                active: draft.active,
                options,
            };
            if (draft.id) {
                await updateQuestion({id: draft.id, body});
            } else {
                await createQuestion(body);
            }
            setToast({message: "Savol saqlandi", type: "success"});
            setDraft(null);
        } catch (error) {
            setToast({message: error instanceof Error ? error.message : "Saqlashda xatolik", type: "error"});
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteQuestion(id);
            setToast({message: "Savol o'chirildi", type: "success"});
        } catch (error) {
            setToast({message: error instanceof Error ? error.message : "O'chirishda xatolik", type: "error"});
        }
    };

    const columns: ColumnDef<InterestQuizQuestionItem>[] = [
        {accessorKey: "text", header: "Savol"},
        {
            accessorKey: "ageGroup",
            header: "Yosh guruhi",
            cell: ({row}) => ageLabel(row.original.ageGroup),
        },
        {
            id: "options",
            header: "Variantlar",
            cell: ({row}) => row.original.options.length,
        },
        {
            accessorKey: "active",
            header: "Holat",
            cell: ({row}) => (row.original.active === false ? "O'chiq" : "Aktiv"),
        },
        {
            id: "actions",
            header: "",
            cell: ({row}) => (
                <div className="flex gap-2">
                    <Button size="sm" onClick={() => openEdit(row.original)}>Tahrirlash</Button>
                    <Button size="sm" variant="danger" onClick={() => handleDelete(row.original.id)}>O'chirish</Button>
                </div>
            ),
        },
    ];

    const inputClass = "h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";

    return (
        <>
            {toast && <StatusToast message={toast.message} type={toast.type} onClose={() => setToast(null)}/>}
            <PageMeta title="Qiziqish testi" description="Kasb tanlash testi savollari"/>
            <PageBreadcrumb pageTitle="Qiziqish testi savollari"/>
            <div className="space-y-6">
                <ComponentCard title="Savollar" desc="Bolaning yosh guruhiga mos savollar va yo'nalish ballari">
                    <div className="flex flex-wrap items-center gap-3">
                        <select
                            value={ageFilter}
                            onChange={(e) => setAgeFilter(e.target.value)}
                            className="h-11 rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                        >
                            <option value="">Barcha yosh guruhlari</option>
                            {AGE_GROUPS.map((group) => (
                                <option key={group.value} value={group.value}>{group.label}</option>
                            ))}
                        </select>
                        <Button size="sm" onClick={() => setDraft(emptyDraft())}>+ Yangi savol</Button>
                    </div>
                    <CommonTable data={filtered} columns={columns} isPending={isPending}/>
                </ComponentCard>
            </div>

            <Modal
                isOpen={Boolean(draft)}
                onClose={() => setDraft(null)}
                className="max-w-[760px] m-4 p-6 sm:p-8"
            >
                {draft && (
                    <div className="max-h-[75vh] space-y-5 overflow-y-auto pr-1">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                            {draft.id ? "Savolni tahrirlash" : "Yangi savol"}
                        </h3>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="sm:col-span-2">
                                <label className="mb-1 block text-sm text-gray-600 dark:text-gray-300">Savol matni</label>
                                <input
                                    value={draft.text}
                                    onChange={(e) => setDraft({...draft, text: e.target.value})}
                                    className={inputClass}
                                    placeholder="Bo'sh vaqtingda nima qilishni yoqtirasan?"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm text-gray-600 dark:text-gray-300">Yosh guruhi</label>
                                <select
                                    value={draft.ageGroup}
                                    onChange={(e) => setDraft({...draft, ageGroup: e.target.value as AgeGroupValue})}
                                    className={inputClass}
                                >
                                    {AGE_GROUPS.map((group) => (
                                        <option key={group.value} value={group.value}>{group.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-end gap-2 pb-1">
                                <input
                                    id="quiz-question-active"
                                    type="checkbox"
                                    checked={draft.active}
                                    onChange={(e) => setDraft({...draft, active: e.target.checked})}
                                />
                                <label htmlFor="quiz-question-active" className="text-sm text-gray-600 dark:text-gray-300">
                                    Aktiv
                                </label>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {draft.options.map((option, optionIndex) => (
                                <div key={optionIndex}
                                     className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                                    <div className="mb-3 flex items-center justify-between">
                                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                                            {optionIndex + 1}-variant
                                        </p>
                                        {draft.options.length > 2 && (
                                            <Button
                                                size="sm"
                                                variant="danger"
                                                onClick={() => setDraft({
                                                    ...draft,
                                                    options: draft.options.filter((_, i) => i !== optionIndex),
                                                })}
                                            >
                                                Olib tashlash
                                            </Button>
                                        )}
                                    </div>
                                    <div className="grid gap-3 sm:grid-cols-[1fr_120px]">
                                        <input
                                            value={option.text}
                                            onChange={(e) => {
                                                const options = [...draft.options];
                                                options[optionIndex] = {...option, text: e.target.value};
                                                setDraft({...draft, options});
                                            }}
                                            className={inputClass}
                                            placeholder="Variant matni"
                                        />
                                        <input
                                            value={option.emoji}
                                            onChange={(e) => {
                                                const options = [...draft.options];
                                                options[optionIndex] = {...option, emoji: e.target.value};
                                                setDraft({...draft, options});
                                            }}
                                            className={inputClass}
                                            placeholder="Emoji 🎨"
                                        />
                                    </div>
                                    <p className="mt-3 mb-1 text-xs text-gray-500 dark:text-gray-400">
                                        Yo'nalishlarga ball (0–5):
                                    </p>
                                    <div className="grid gap-2 sm:grid-cols-3">
                                        {fields.map((field) => (
                                            <label key={field.key}
                                                   className="flex items-center justify-between gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm dark:border-gray-700 dark:text-gray-200">
                                                <span className="truncate">{field.label}</span>
                                                <input
                                                    type="number"
                                                    min={0}
                                                    max={5}
                                                    value={option.fieldWeights[field.key] ?? ""}
                                                    onChange={(e) => {
                                                        const options = [...draft.options];
                                                        const fieldWeights = {...option.fieldWeights};
                                                        const value = Number(e.target.value);
                                                        if (e.target.value === "" || value <= 0) {
                                                            delete fieldWeights[field.key];
                                                        } else {
                                                            fieldWeights[field.key] = Math.min(5, value);
                                                        }
                                                        options[optionIndex] = {...option, fieldWeights};
                                                        setDraft({...draft, options});
                                                    }}
                                                    className="h-9 w-16 rounded-lg border border-gray-300 bg-transparent px-2 text-sm dark:border-gray-700 dark:bg-gray-900"
                                                />
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}
                            {draft.options.length < 6 && (
                                <Button size="sm" onClick={() => setDraft({
                                    ...draft,
                                    options: [...draft.options, emptyOption()],
                                })}>
                                    + Variant qo'shish
                                </Button>
                            )}
                        </div>

                        <div className="flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setDraft(null)}>Bekor qilish</Button>
                            <Button onClick={handleSave} isPending={isCreating || isUpdating}>Saqlash</Button>
                        </div>
                    </div>
                )}
            </Modal>
        </>
    );
}
