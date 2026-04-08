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
import { Course } from "@/types/course";

export default function QuestionnaireForm() {

    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [courses, setCourses] = useState<Course[]>([]);
    const session = UserServices.getCurrentUser();
    // ===========================================================================
    useEffect(() => {
        (async () => {
            if (!session) return;
            const { success, courses } = await CourseServices.getAll(session, 1, { status: 'published' });
            if (success && courses) setCourses(courses);
        })();
    }, []);
    // ===========================================================================
    const handleOnSubmit = async (data: any) => {
        if (!session) return;
        setError(null);
        const isLeveling = data.type === 'leveling';
        const selectedCourse = courses.find(c => c.id === data.courseId);

        const { success, id, error } = await QuestionnaireServices.create(session, {
            title: data.title,
            type: data.type,
            courseId: isLeveling ? undefined : data.courseId,
            courseTitle: isLeveling ? undefined : selectedCourse?.title,
            timeLimit: data.timeLimit ? Number(data.timeLimit) : undefined,
            passingScore: data.passingScore ? Number(data.passingScore) : undefined,
        });

        if (success && id) {
            setFlashData({ success: 'Questionário criado com sucesso!' });
            router.replace(`/admin/questionarios/${id}`);
        } else {
            setError(error ?? 'Erro ao criar questionário.');
        }
    }
    // ===========================================================================
    return (
        <Formik
            initialValues={{
                title: '',
                type: 'leveling',
                courseId: '',
                timeLimit: '',
                passingScore: '',
            }}
            validationSchema={Yup.object({
                title: Yup.string().required('Campo obrigatório'),
                type: Yup.string().required('Campo obrigatório'),
                courseId: Yup.string().when('type', {
                    is: (val: string) => val !== 'leveling',
                    then: (s) => s.required('Selecione um curso'),
                }),
                passingScore: Yup.number().when('type', {
                    is: 'post_content',
                    then: (s) => s
                        .required('Nota mínima obrigatória para pós-conteúdo')
                        .min(0, 'Mínimo 0')
                        .max(100, 'Máximo 100'),
                }),
            })}
            onSubmit={handleOnSubmit}
        >
            {({ handleChange, handleSubmit, isSubmitting, isValid, errors, values }) => (
                <form>
                    <AppInput
                        placeholder="Digite o título do questionário"
                        label="Título:"
                        name="title"
                        onChange={handleChange}
                        icon="ios-list"
                        error={errors.title}
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

                    {/* Curso — apenas para pre_content e post_content */}
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
                    />

                    {/* Nota mínima — apenas para post_content */}
                    {values.type === 'post_content' && (
                        <AppInput
                            placeholder="Ex: 70 (significa 70%)"
                            label="Nota mínima para aprovação (%):"
                            name="passingScore"
                            type="number"
                            onChange={handleChange}
                            icon="checkmark-circled"
                            error={errors.passingScore}
                        />
                    )}

                    {error && <p className="my-3 text-[tomato] text-[15px]">{error}</p>}
                    <AppButton
                        title="Criar questionário"
                        icon="checkmark"
                        onClick={() => handleSubmit()}
                        disabled={!isValid || isSubmitting}
                    />
                </form>
            )}
        </Formik>
    )
}