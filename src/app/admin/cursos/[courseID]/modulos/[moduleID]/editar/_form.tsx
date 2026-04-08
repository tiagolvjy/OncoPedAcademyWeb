"use client";
import { AppButton, AppInput } from "@/themes/components";
import { Formik } from "formik";
import * as Yup from 'yup';
import CourseServices from "@/services/courses";
import { useRouter } from "next/navigation";
import { setFlashData } from "@/helpers/router";
import { useEffect, useState } from "react";
import { Module } from "@/types/course";

export default function ModuleEditForm({ courseID, moduleID }: { courseID: string; moduleID: string }) {

    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [module, setModule] = useState<Partial<Module>>({ title: '', order: 1 });
    // ===========================================================================
    useEffect(() => {
        (async () => {
            const { success, modules } = await CourseServices.getModules(courseID);
            if (success && modules) {
                const found = modules.find(m => m.id === moduleID);
                if (found) setModule(found);
                else {
                    setFlashData({ error: 'Módulo não encontrado.' });
                    router.replace(`/admin/cursos/${courseID}`);
                }
            }
        })();
    }, []);
    // ===========================================================================
    const handleOnSubmit = async (data: any) => {
        setError(null);
        const { success, error } = await CourseServices.updateModule(courseID, moduleID, {
            title: data.title,
            order: Number(data.order),
        });
        if (success) {
            setFlashData({ success: 'Módulo atualizado com sucesso!' });
            router.replace(`/admin/cursos/${courseID}`);
        } else {
            setError(error ?? 'Erro ao atualizar módulo.');
        }
    }
    // ===========================================================================
    return (
        <Formik
            initialValues={{
                title: module.title ?? '',
                order: module.order ?? 1,
            }}
            enableReinitialize
            validationSchema={Yup.object({
                title: Yup.string().required('Campo obrigatório'),
                order: Yup.number()
                    .typeError('Deve ser um número')
                    .required('Campo obrigatório')
                    .min(1, 'Mínimo 1'),
            })}
            onSubmit={handleOnSubmit}
        >
            {({ handleChange, handleSubmit, isSubmitting, isValid, errors, values }) => (
                <form>
                    <AppInput
                        placeholder="Digite o título do módulo"
                        label="Título:"
                        name="title"
                        onChange={handleChange}
                        icon="ios-list"
                        error={errors.title}
                        value={values.title}
                    />
                    <AppInput
                        placeholder="Ordem de exibição"
                        label="Ordem:"
                        name="order"
                        type="number"
                        onChange={handleChange}
                        icon="ios-keypad"
                        error={errors.order}
                        value={values.order.toString()}
                    />

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