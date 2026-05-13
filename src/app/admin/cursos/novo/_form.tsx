"use client";
import { AppButton, AppInput, AppSelect } from "@/themes/components";
import PhotoUpload from "@/themes/components/photo-upload";
import { Formik } from "formik";
import * as Yup from 'yup';
import CourseServices from "@/services/courses";
import UserServices from "@/services/user";
import { useRouter } from "next/navigation";
import { setFlashData } from "@/helpers/router";
import { useState } from "react";

export default function CourseForm() {

    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [coverImage, setCoverImage] = useState<string | null>(null);
    const session = UserServices.getCurrentUser();
    // ===========================================================================
    const handleOnSubmit = async (data: any) => {
        if (!session) return;
        setError(null);
        const { success, id, error } = await CourseServices.create(session, {
            title: data.title,
            description: data.description,
            duration: Number(data.duration),
            hasCertificate: data.hasCertificate === 'true',
            coverImage: coverImage ?? null,
        });
        if (success && id) {
            setFlashData({ success: 'Curso criado com sucesso!' });
            router.replace(`/admin/cursos/${id}`);
        } else {
            setError(error ?? 'Erro ao criar curso.');
        }
    }
    // ===========================================================================
    return (
        <Formik
            initialValues={{
                title: '',
                description: '',
                duration: '',
                hasCertificate: 'false',
            }}
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
                    {/* CAPA DO CURSO */}
                    <p className="ff-default ml-3 mb-1">Capa do curso:</p>
                    <PhotoUpload
                        currentURL={coverImage}
                        onUpload={(url) => setCoverImage(url)}
                        folder="courses"
                        shape="square"
                    />

                    <AppInput
                        placeholder="Digite o título do curso"
                        label="Título:"
                        name="title"
                        onChange={handleChange}
                        icon="ios-book"
                        error={errors.title}
                    />
                    <AppInput
                        placeholder="Descreva o curso"
                        label="Descrição:"
                        name="description"
                        onChange={handleChange}
                        icon="ios-paper"
                        error={errors.description}
                    />
                    <AppInput
                        placeholder="Duração em horas"
                        label="Duração (horas):"
                        name="duration"
                        type="number"
                        onChange={handleChange}
                        icon="clock"
                        error={errors.duration}
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
                        title="Criar curso"
                        icon="checkmark"
                        onClick={() => handleSubmit()}
                        disabled={!isValid || isSubmitting}
                    />
                </form>
            )}
        </Formik>
    )
}