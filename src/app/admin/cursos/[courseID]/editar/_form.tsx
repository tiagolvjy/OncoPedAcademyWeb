"use client";
import { AppButton, AppInput, AppSelect } from "@/themes/components";
import { Formik } from "formik";
import * as Yup from 'yup';
import CourseServices from "@/services/courses";
import UserServices from "@/services/user";
import { useRouter } from "next/navigation";
import { setFlashData } from "@/helpers/router";
import { useEffect, useState } from "react";
import { Course } from "@/types/course";

export default function CourseEditForm({ courseID }: { courseID: string }) {

    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [course, setCourse] = useState<Partial<Course>>({
        title: '',
        description: '',
        duration: 0,
        hasCertificate: false,
    });
    const session = UserServices.getCurrentUser();
    // ===========================================================================
    useEffect(() => {
        (async () => {
            const { success, course } = await CourseServices.getById(courseID);
            if (success && course) {
                // Verifica permissão — médico só edita o próprio curso
                if (session?.role === 'doctor' && course.authorId !== session.uid) {
                    setFlashData({ error: 'Sem permissão para editar este curso.' });
                    router.replace('/admin/cursos');
                    return;
                }
                setCourse(course);
            } else {
                setFlashData({ error: 'Curso não encontrado.' });
                router.replace('/admin/cursos');
            }
        })();
    }, []);
    // ===========================================================================
    const handleOnSubmit = async (data: any) => {
        setError(null);
        const { success, error } = await CourseServices.update(courseID, {
            title: data.title,
            description: data.description,
            duration: Number(data.duration),
            hasCertificate: data.hasCertificate === 'true',
        });
        if (success) {
            setFlashData({ success: 'Curso atualizado com sucesso!' });
            router.replace(`/admin/cursos/${courseID}`);
        } else {
            setError(error ?? 'Erro ao atualizar curso.');
        }
    }
    // ===========================================================================
    return (
        <Formik
            initialValues={{
                title: course.title ?? '',
                description: course.description ?? '',
                duration: course.duration ?? '',
                hasCertificate: course.hasCertificate ? 'true' : 'false',
            }}
            enableReinitialize
            validationSchema={Yup.object({
                title: Yup.string().required('Campo obrigatório'),
                description: Yup.string().required('Campo obrigatório'),
                duration: Yup.number()
                    .typeError('Deve ser um número')
                    .required('Campo obrigatório')
                    .min(1, 'Mínimo 1 hora'),
            })}
            onSubmit={handleOnSubmit}
        >
            {({ handleChange, handleSubmit, isSubmitting, isValid, errors, values }) => (
                <form>
                    <AppInput
                        placeholder="Digite o título do curso"
                        label="Título:"
                        name="title"
                        onChange={handleChange}
                        icon="ios-book"
                        error={errors.title}
                        value={values.title}
                    />
                    <AppInput
                        placeholder="Descreva o curso"
                        label="Descrição:"
                        name="description"
                        onChange={handleChange}
                        icon="ios-paper"
                        error={errors.description}
                        value={values.description}
                    />
                    <AppInput
                        placeholder="Duração em horas"
                        label="Duração (horas):"
                        name="duration"
                        type="number"
                        onChange={handleChange}
                        icon="clock"
                        error={errors.duration}
                        value={values.duration.toString()}
                    />
                    <AppSelect
                        label="Emite certificado:"
                        name="hasCertificate"
                        onChange={handleChange}
                        value={values.hasCertificate}
                    >
                        <option value="false">Não</option>
                        <option value="true">Sim</option>
                    </AppSelect>

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