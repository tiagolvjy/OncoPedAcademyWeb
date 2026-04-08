"use client";
import { AppButton, AppInput } from "@/themes/components";
import { Formik } from "formik";
import * as Yup from 'yup';
import CourseServices from "@/services/courses";
import { useRouter } from "next/navigation";
import { setFlashData } from "@/helpers/router";
import { useState } from "react";

export default function ModuleForm({ courseID }: { courseID: string }) {

    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    // ===========================================================================
    const handleOnSubmit = async (data: any) => {
        setError(null);
        const { success, error } = await CourseServices.createModule(courseID, {
            title: data.title,
            order: Number(data.order),
        });
        if (success) {
            setFlashData({ success: 'Módulo criado com sucesso!' });
            router.replace(`/admin/cursos/${courseID}`);
        } else {
            setError(error ?? 'Erro ao criar módulo.');
        }
    }
    // ===========================================================================
    return (
        <Formik
            initialValues={{ title: '', order: '' }}
            validationSchema={Yup.object({
                title: Yup.string().required('Campo obrigatório'),
                order: Yup.number()
                    .typeError('Deve ser um número')
                    .required('Campo obrigatório')
                    .min(1, 'Mínimo 1'),
            })}
            onSubmit={handleOnSubmit}
        >
            {({ handleChange, handleSubmit, isSubmitting, isValid, errors }) => (
                <form>
                    <AppInput
                        placeholder="Digite o título do módulo"
                        label="Título:"
                        name="title"
                        onChange={handleChange}
                        icon="ios-list"
                        error={errors.title}
                    />
                    <AppInput
                        placeholder="Ordem de exibição"
                        label="Ordem:"
                        name="order"
                        type="number"
                        onChange={handleChange}
                        icon="ios-keypad"
                        error={errors.order}
                    />

                    {error && <p className="my-3 text-[tomato] text-[15px]">{error}</p>}
                    <AppButton
                        title="Criar módulo"
                        icon="checkmark"
                        onClick={() => handleSubmit()}
                        disabled={!isValid || isSubmitting}
                    />
                </form>
            )}
        </Formik>
    )
}