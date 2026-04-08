"use client";
import { AppButton, AppInput, AppSelect } from "@/themes/components";
import { Formik } from "formik";
import * as Yup from 'yup';
import QuestionnaireServices from "@/services/questionnaires";
import CourseServices from "@/services/courses";
import UserServices from "@/services/user";
import { useRouter } from "next/navigation";
import { setFlashData } from "@/helpers/router";
import { useEffect, useState } from "react";
import { Questionnaire } from "@/types/questionnaire";
import { Course } from "@/types/course";

export default function QuestionnaireEditForm({ questionnaireID }: { questionnaireID: string }) {

    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [questionnaire, setQuestionnaire] = useState<Partial<Questionnaire>>({});
    const [courses, setCourses] = useState<Course[]>([]);
    const session = UserServices.getCurrentUser();
    // ===========================================================================
    useEffect(() => {
        (async () => {
            if (!session) return;
            const [qResult, cResult] = await Promise.all([
                QuestionnaireServices.getById(questionnaireID),
                CourseServices.getAll(session, 1, { status: 'published' }),
            ]);
            if (qResult.success && qResult.questionnaire) {
                setQuestionnaire(qResult.questionnaire);
            } else {
                setFlashData({ error: 'Questionário não encontrado.' });
                router.replace('/admin/questionarios');
            }
            if (cResult.success && cResult.courses) setCourses(cResult.courses);
        })();
    }, []);
    // ===========================================================================
        const handleOnSubmit = async (data: any) => {
        setError(null);
        const isLeveling = data.type === 'leveling';
        const selectedCourse = courses.find(c => c.id === data.courseId);

        const { success, error } = await QuestionnaireServices.update(questionnaireID, {
            title: data.title,
            type: data.type,
            courseId: isLeveling ? null : data.courseId,
            courseTitle: isLeveling ? null : selectedCourse?.title ?? null,
            timeLimit: data.timeLimit ? Number(data.timeLimit) : null,
            passingScore: data.passingScore ? Number(data.passingScore) : null,
        });

        if (success) {
            setFlashData({ success: 'Questionário atualizado com sucesso!' });
            router.replace(`/admin/questionarios/${questionnaireID}`);
        } else {
            setError(error ?? 'Erro ao atualizar questionário.');
        }
    }
    // ===========================================================================
    return (
        <Formik
            initialValues={{
                title: questionnaire.title ?? '',
                type: questionnaire.type ?? 'leveling',
                courseId: questionnaire.courseId ?? '',
                timeLimit: questionnaire.timeLimit ?? '',
                passingScore: questionnaire.passingScore ?? '',
            }}
            enableReinitialize
            validationSchema={Yup.object({
                title: Yup.string().required('Campo obrigatório'),
                courseId: Yup.string().when('type', {
                    is: (val: string) => val !== 'leveling',
                    then: (s) => s.required('Selecione um curso'),
                }),
                passingScore: Yup.number().when('type', {
                    is: 'post_content',
                    then: (s) => s
                        .required('Nota mínima obrigatória')
                        .min(0).max(100),
                }),
            })}
            onSubmit={handleOnSubmit}
        >
            {({ handleChange, handleSubmit, isSubmitting, isValid, errors, values }) => (
                <form>
                    <AppInput
                        placeholder="Digite o título"
                        label="Título:"
                        name="title"
                        onChange={handleChange}
                        icon="ios-list"
                        error={errors.title}
                        value={values.title}
                    />
                    <AppSelect
                        label="Tipo:"
                        name="type"
                        onChange={handleChange}
                        value={values.type}
                    >
                        <option value="leveling">Nivelamento Geral</option>
                        <option value="pre_content">Pré-conteúdo</option>
                        <option value="post_content">Pós-conteúdo</option>
                    </AppSelect>

                    {values.type !== 'leveling' && (
                        <AppSelect
                            label="Curso vinculado:"
                            name="courseId"
                            onChange={handleChange}
                            value={values.courseId}
                        >
                            <option value="">Selecione um curso</option>
                            {courses.map(c => (
                                <option key={c.id} value={c.id}>{c.title}</option>
                            ))}
                        </AppSelect>
                    )}

                    <AppInput
                        placeholder="Tempo limite em minutos (opcional)"
                        label="Tempo limite (em minutos):"
                        name="timeLimit"
                        type="number"
                        onChange={handleChange}
                        icon="clock"
                        value={values.timeLimit?.toString()}
                    />

                    {values.type === 'post_content' && (
                        <AppInput
                            placeholder="Ex: 70 (significa 70%)"
                            label="Nota mínima para aprovação (%):"
                            name="passingScore"
                            type="number"
                            onChange={handleChange}
                            icon="checkmark-circled"
                            error={errors.passingScore}
                            value={values.passingScore?.toString()}
                        />
                    )}

                    {error && <p className="my-3 text-[tomato] text-[15px]">{error}</p>}
                    <AppButton
                        title="Salvar alterações"
                        icon="checkmark"
                        onClick={() => handleSubmit()}
                        disabled={!isValid || isSubmitting}
                    />
                </form>
            )}
        </Formik>
    )
}