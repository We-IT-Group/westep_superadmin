import {useEffect, useState} from "react";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import Button from "../../components/ui/button/Button.tsx";
import StatusToast from "../../components/paymentSettings/StatusToast.tsx";
import {
    AgeGroupValue,
    RoadmapItemTypeValue,
    RoadmapTemplateDto,
} from "../../api/roadmap/roadmapApi.ts";
import {
    useProfessionCourses,
    useProfessionOptions,
    useRoadmapTemplate,
    useUpsertRoadmapTemplate,
} from "../../api/roadmap/useRoadmap.ts";

const AGE_GROUPS: Array<{ value: AgeGroupValue | ""; label: string }> = [
    {value: "", label: "Barcha yoshlar"},
    {value: "KIDS_5_8", label: "5–8 yoshdan"},
    {value: "JUNIOR_9_12", label: "9–12 yoshdan"},
    {value: "TEEN_13_17", label: "13–17 yoshdan"},
];

const ITEM_TYPES: Array<{ value: RoadmapItemTypeValue; label: string }> = [
    {value: "COURSE", label: "Kurs"},
    {value: "SKILL", label: "Ko'nikma"},
    {value: "EXTERNAL", label: "Tashqi tavsiya"},
];

interface ItemDraft {
    itemType: RoadmapItemTypeValue;
    courseId: string;
    title: string;
    description: string;
    required: boolean;
}

interface StageDraft {
    name: string;
    description: string;
    minAgeGroup: AgeGroupValue | "";
    estimatedWeeks: string;
    items: ItemDraft[];
}

interface TemplateDraft {
    name: string;
    description: string;
    published: boolean;
    stages: StageDraft[];
}

const emptyItem = (): ItemDraft => ({itemType: "COURSE", courseId: "", title: "", description: "", required: true});
const emptyStage = (): StageDraft => ({name: "", description: "", minAgeGroup: "", estimatedWeeks: "", items: [emptyItem()]});
const emptyTemplate = (): TemplateDraft => ({name: "", description: "", published: false, stages: [emptyStage()]});

function draftFromDto(dto: RoadmapTemplateDto): TemplateDraft {
    return {
        name: dto.name,
        description: dto.description || "",
        published: dto.published,
        stages: dto.stages.map((stage) => ({
            name: stage.name,
            description: stage.description || "",
            minAgeGroup: (stage.minAgeGroup as AgeGroupValue) || "",
            estimatedWeeks: stage.estimatedWeeks != null ? String(stage.estimatedWeeks) : "",
            items: stage.items.map((item) => ({
                itemType: item.itemType,
                courseId: item.courseId || "",
                title: item.title,
                description: item.description || "",
                required: item.required !== false,
            })),
        })),
    };
}

export default function RoadmapTemplatesPage() {
    const [professionId, setProfessionId] = useState("");
    const [draft, setDraft] = useState<TemplateDraft | null>(null);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

    const {data: professions = []} = useProfessionOptions();
    const {data: template, isFetching} = useRoadmapTemplate(professionId || undefined);
    const {data: courses = []} = useProfessionCourses(professionId || undefined);
    const {mutateAsync: save, isPending: isSaving} = useUpsertRoadmapTemplate();

    useEffect(() => {
        if (!professionId) {
            setDraft(null);
            return;
        }
        setDraft(template ? draftFromDto(template) : emptyTemplate());
    }, [professionId, template]);

    const updateStage = (index: number, patch: Partial<StageDraft>) => {
        if (!draft) return;
        const stages = [...draft.stages];
        stages[index] = {...stages[index], ...patch};
        setDraft({...draft, stages});
    };

    const updateItem = (stageIndex: number, itemIndex: number, patch: Partial<ItemDraft>) => {
        if (!draft) return;
        const stages = [...draft.stages];
        const items = [...stages[stageIndex].items];
        items[itemIndex] = {...items[itemIndex], ...patch};
        stages[stageIndex] = {...stages[stageIndex], items};
        setDraft({...draft, stages});
    };

    const handleSave = async () => {
        if (!draft || !professionId) return;
        if (!draft.name.trim()) {
            setToast({message: "Shablon nomini kiriting", type: "error"});
            return;
        }
        for (const stage of draft.stages) {
            if (!stage.name.trim()) {
                setToast({message: "Har bosqichga nom kiriting", type: "error"});
                return;
            }
            for (const item of stage.items) {
                if (!item.title.trim()) {
                    setToast({message: "Har elementga nom kiriting", type: "error"});
                    return;
                }
                if (item.itemType === "COURSE" && !item.courseId) {
                    setToast({message: "Kurs turidagi elementga kurs tanlang", type: "error"});
                    return;
                }
            }
        }
        try {
            await save({
                professionId,
                body: {
                    name: draft.name.trim(),
                    description: draft.description.trim() || null,
                    published: draft.published,
                    stages: draft.stages.map((stage, stageIndex) => ({
                        name: stage.name.trim(),
                        description: stage.description.trim() || null,
                        orderIndex: stageIndex,
                        minAgeGroup: stage.minAgeGroup || null,
                        estimatedWeeks: stage.estimatedWeeks ? Number(stage.estimatedWeeks) : null,
                        items: stage.items.map((item, itemIndex) => ({
                            itemType: item.itemType,
                            courseId: item.itemType === "COURSE" ? item.courseId : null,
                            title: item.title.trim(),
                            description: item.description.trim() || null,
                            orderIndex: itemIndex,
                            required: item.required,
                        })),
                    })),
                },
            });
            setToast({message: "Shablon saqlandi", type: "success"});
        } catch (error) {
            setToast({message: error instanceof Error ? error.message : "Saqlashda xatolik", type: "error"});
        }
    };

    const inputClass = "h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";
    const smallInputClass = "h-10 rounded-lg border border-gray-300 bg-transparent px-3 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";

    return (
        <>
            {toast && <StatusToast message={toast.message} type={toast.type} onClose={() => setToast(null)}/>}
            <PageMeta title="Roadmap shablonlari" description="Kasb yo'l xaritasi shablonlari"/>
            <PageBreadcrumb pageTitle="Roadmap shablonlari"/>
            <div className="space-y-6">
                <ComponentCard
                    title="Kasb yo'l xaritasi"
                    desc="Bosqichlar va elementlar. Bola kasbi tasdiqlanganda shu shablondan yoshiga mos shaxsiy xarita yaratiladi."
                >
                    <div className="flex flex-wrap items-center gap-3">
                        <select
                            value={professionId}
                            onChange={(e) => setProfessionId(e.target.value)}
                            className={smallInputClass}
                        >
                            <option value="">Kasbni tanlang</option>
                            {professions.map((p) => (
                                <option key={p.id} value={p.id}>{p.emoji} {p.title}</option>
                            ))}
                        </select>
                        {isFetching && <span className="text-sm text-gray-500">Yuklanmoqda...</span>}
                        {template && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                v{template.version} {template.published ? "· E'lon qilingan" : "· Qoralama"}
                            </span>
                        )}
                    </div>

                    {draft && (
                        <div className="mt-5 space-y-5">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="mb-1 block text-sm text-gray-600 dark:text-gray-300">Shablon nomi</label>
                                    <input
                                        value={draft.name}
                                        onChange={(e) => setDraft({...draft, name: e.target.value})}
                                        className={inputClass}
                                        placeholder="Dasturchi yo'li"
                                    />
                                </div>
                                <div className="flex items-end gap-2 pb-1">
                                    <input
                                        id="roadmap-published"
                                        type="checkbox"
                                        checked={draft.published}
                                        onChange={(e) => setDraft({...draft, published: e.target.checked})}
                                    />
                                    <label htmlFor="roadmap-published" className="text-sm text-gray-600 dark:text-gray-300">
                                        E'lon qilingan (bolalarga xarita shu holatda yaratiladi)
                                    </label>
                                </div>
                            </div>

                            {draft.stages.map((stage, stageIndex) => (
                                <div key={stageIndex} className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                                    <div className="mb-3 flex items-center justify-between">
                                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                                            {stageIndex + 1}-bosqich
                                        </p>
                                        {draft.stages.length > 1 && (
                                            <Button size="sm" variant="danger" onClick={() => setDraft({
                                                ...draft,
                                                stages: draft.stages.filter((_, i) => i !== stageIndex),
                                            })}>
                                                Bosqichni o'chirish
                                            </Button>
                                        )}
                                    </div>
                                    <div className="grid gap-3 sm:grid-cols-3">
                                        <input
                                            value={stage.name}
                                            onChange={(e) => updateStage(stageIndex, {name: e.target.value})}
                                            className={inputClass}
                                            placeholder="Bosqich nomi (Tanishuv)"
                                        />
                                        <select
                                            value={stage.minAgeGroup}
                                            onChange={(e) => updateStage(stageIndex, {minAgeGroup: e.target.value as AgeGroupValue | ""})}
                                            className={inputClass}
                                        >
                                            {AGE_GROUPS.map((g) => (
                                                <option key={g.value} value={g.value}>{g.label}</option>
                                            ))}
                                        </select>
                                        <input
                                            type="number"
                                            min={1}
                                            value={stage.estimatedWeeks}
                                            onChange={(e) => updateStage(stageIndex, {estimatedWeeks: e.target.value})}
                                            className={inputClass}
                                            placeholder="Taxminiy hafta"
                                        />
                                    </div>

                                    <div className="mt-4 space-y-3">
                                        {stage.items.map((item, itemIndex) => (
                                            <div key={itemIndex}
                                                 className="grid gap-2 rounded-lg border border-gray-100 p-3 dark:border-gray-800 sm:grid-cols-[130px_1fr_1fr_90px_36px]">
                                                <select
                                                    value={item.itemType}
                                                    onChange={(e) => updateItem(stageIndex, itemIndex, {itemType: e.target.value as RoadmapItemTypeValue})}
                                                    className={smallInputClass}
                                                >
                                                    {ITEM_TYPES.map((t) => (
                                                        <option key={t.value} value={t.value}>{t.label}</option>
                                                    ))}
                                                </select>
                                                {item.itemType === "COURSE" ? (
                                                    <select
                                                        value={item.courseId}
                                                        onChange={(e) => {
                                                            const course = courses.find((c) => c.id === e.target.value);
                                                            updateItem(stageIndex, itemIndex, {
                                                                courseId: e.target.value,
                                                                title: item.title || course?.name || "",
                                                            });
                                                        }}
                                                        className={smallInputClass}
                                                    >
                                                        <option value="">Kurs tanlang</option>
                                                        {courses.map((c) => (
                                                            <option key={c.id} value={c.id}>{c.name}</option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <span className="self-center text-xs text-gray-400">—</span>
                                                )}
                                                <input
                                                    value={item.title}
                                                    onChange={(e) => updateItem(stageIndex, itemIndex, {title: e.target.value})}
                                                    className={smallInputClass}
                                                    placeholder="Element nomi"
                                                />
                                                <label className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-300">
                                                    <input
                                                        type="checkbox"
                                                        checked={item.required}
                                                        onChange={(e) => updateItem(stageIndex, itemIndex, {required: e.target.checked})}
                                                    />
                                                    Majburiy
                                                </label>
                                                <button
                                                    type="button"
                                                    onClick={() => updateStage(stageIndex, {
                                                        items: stage.items.filter((_, i) => i !== itemIndex),
                                                    })}
                                                    disabled={stage.items.length <= 1}
                                                    className="self-center text-red-500 disabled:opacity-30"
                                                    title="Elementni o'chirish"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ))}
                                        <Button size="sm" variant="outline" onClick={() => updateStage(stageIndex, {
                                            items: [...stage.items, emptyItem()],
                                        })}>
                                            + Element
                                        </Button>
                                    </div>
                                </div>
                            ))}

                            <div className="flex flex-wrap gap-3">
                                <Button variant="outline" onClick={() => setDraft({
                                    ...draft,
                                    stages: [...draft.stages, emptyStage()],
                                })}>
                                    + Bosqich qo'shish
                                </Button>
                                <Button onClick={handleSave} isPending={isSaving}>Shablonni saqlash</Button>
                            </div>
                        </div>
                    )}
                </ComponentCard>
            </div>
        </>
    );
}
