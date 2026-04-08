"use client";
import { AppButton, AppInput } from "@/themes/components";
import { Formik } from "formik";
import * as Yup from 'yup';
import CourseServices from "@/services/courses";
import { useRouter } from "next/navigation";
import { setFlashData } from "@/helpers/router";
import { useEffect, useRef, useState } from "react";
import { Lesson } from "@/types/course";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

export default function LessonEditForm({
    courseID, moduleID, lessonID
}: {
    courseID: string; moduleID: string; lessonID: string
}) {

    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [lesson, setLesson] = useState<Partial<Lesson>>({ title: '', duration: 0, order: 1 });
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [videoURL, setVideoURL] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    // ===========================================================================
    useEffect(() => {
        (async () => {
            const { success, lessons } = await CourseServices.getLessons(courseID, moduleID);
            if (success && lessons) {
                const found = lessons.find(l => l.id === lessonID);
                if (found) {
                    setLesson(found);
                    setVideoURL(found.videoURL ?? null);
                } else {
                    setFlashData({ error: 'Aula não encontrada.' });
                    router.replace(`/admin/cursos/${courseID}`);
                }
            }
        })();
    }, []);
    // ===========================================================================
    const handleVideoUpload = async (file: File) => {
        setUploading(true);
        setUploadProgress(0);
        setError(null);
        try {
            const storage = getStorage();
            const storageRef = ref(storage, `courses/${courseID}/modules/${moduleID}/lessons/${lessonID}/${file.name}`);
            const uploadTask = uploadBytesResumable(storageRef, file);

            uploadTask.on('state_changed',
                (snapshot) => {
                    const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                    setUploadProgress(progress);
                },
                (err) => {
                    setError('Erro no upload do vídeo.');
                    setUploading(false);
                },
                async () => {
                    const url = await getDownloadURL(uploadTask.snapshot.ref);
                    setVideoURL(url);
                    // Salva URL na aula
                    await CourseServices.updateLesson(courseID, moduleID, lessonID, { videoURL: url });
                    setUploading(false);
                    setUploadProgress(100);
                }
            );
        } catch {
            setError('Erro no upload do vídeo.');
            setUploading(false);
        }
    }
    // ===========================================================================
    const handleOnSubmit = async (data: any) => {
        setError(null);
        const { success, error } = await CourseServices.updateLesson(courseID, moduleID, lessonID, {
            title: data.title,
            duration: Number(data.duration),
            order: Number(data.order),
        });
        if (success) {
            setFlashData({ success: 'Aula atualizada com sucesso!' });
            router.replace(`/admin/cursos/${courseID}`);
        } else {
            setError(error ?? 'Erro ao atualizar aula.');
        }
    }
    // ===========================================================================
    return (
        <div>
            <Formik
                initialValues={{
                    title: lesson.title ?? '',
                    duration: lesson.duration ?? '',
                    order: lesson.order ?? 1,
                }}
                enableReinitialize
                validationSchema={Yup.object({
                    title: Yup.string().required('Campo obrigatório'),
                    duration: Yup.number()
                        .typeError('Deve ser um número')
                        .required('Campo obrigatório')
                        .min(1, 'Mínimo 1 minuto'),
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
                            placeholder="Digite o título da aula"
                            label="Título:"
                            name="title"
                            onChange={handleChange}
                            icon="ios-film"
                            error={errors.title}
                            value={values.title}
                        />
                        <AppInput
                            placeholder="Duração em minutos"
                            label="Duração (min):"
                            name="duration"
                            type="number"
                            onChange={handleChange}
                            icon="clock"
                            error={errors.duration}
                            value={values.duration.toString()}
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

            {/* UPLOAD DE VÍDEO */}
            <div className="mt-6 border-t pt-6">
                <h3 className="font-bold text-[16px] mb-3">Vídeo da aula</h3>

                {videoURL && (
                    <div className="mb-3">
                        <p className="text-sm text-[#1aab67] mb-2">✓ Vídeo enviado</p>
                        <video src={videoURL} controls className="w-full max-w-[500px] rounded-lg" />
                    </div>
                )}

                {uploading && (
                    <div className="mb-3">
                        <p className="text-sm text-gray-500 mb-1">Enviando... {uploadProgress}%</p>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-[#4703D0] h-2 rounded-full transition-all"
                                style={{ width: `${uploadProgress}%` }}
                            />
                        </div>
                    </div>
                )}

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleVideoUpload(file);
                    }}
                />
                <AppButton
                    title={videoURL ? "Substituir vídeo" : "Enviar vídeo"}
                    icon="ios-cloud-upload"
                    form="round"
                    type="outline"
                    disabled={uploading}
                    onClick={() => fileInputRef.current?.click()}
                />
            </div>
        </div>
    )
}