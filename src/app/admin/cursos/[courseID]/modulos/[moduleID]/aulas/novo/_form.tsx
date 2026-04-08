"use client";
import { AppButton, AppInput } from "@/themes/components";
import { Formik } from "formik";
import * as Yup from 'yup';
import CourseServices from "@/services/courses";
import { useRouter } from "next/navigation";
import { setFlashData } from "@/helpers/router";
import { useState, useRef } from "react";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

export default function LessonForm({ courseID, moduleID }: { courseID: string; moduleID: string }) {

    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [videoURL, setVideoURL] = useState<string | null>(null);
    const [videoFileName, setVideoFileName] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    // ===========================================================================
    const handleVideoUpload = async (file: File, lessonId: string) => {
        setUploading(true);
        setUploadProgress(0);
        setError(null);
        try {
            const storage = getStorage();
            const storageRef = ref(storage, `courses/${courseID}/modules/${moduleID}/lessons/${lessonId}/${file.name}`);
            const uploadTask = uploadBytesResumable(storageRef, file);

            return new Promise<string>((resolve, reject) => {
                uploadTask.on('state_changed',
                    (snapshot) => {
                        const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                        setUploadProgress(progress);
                    },
                    (err) => {
                        setError('Erro no upload do vídeo.');
                        setUploading(false);
                        reject(err);
                    },
                    async () => {
                        const url = await getDownloadURL(uploadTask.snapshot.ref);
                        setVideoURL(url);
                        setUploading(false);
                        resolve(url);
                    }
                );
            });
        } catch {
            setError('Erro no upload do vídeo.');
            setUploading(false);
            throw new Error('Upload failed');
        }
    }
    // ===========================================================================
    const handleOnSubmit = async (data: any) => {
        setError(null);

        // 1. Cria a aula primeiro para ter o lessonId
        const { success, id, error } = await CourseServices.createLesson(courseID, moduleID, {
            title: data.title,
            duration: Number(data.duration),
            order: Number(data.order),
        });

        if (!success || !id) {
            setError(error ?? 'Erro ao criar aula.');
            return;
        }

        // 2. Se tem vídeo selecionado, faz upload agora
        const file = fileInputRef.current?.files?.[0];
        if (file) {
            try {
                const url = await handleVideoUpload(file, id);
                await CourseServices.updateLesson(courseID, moduleID, id, { videoURL: url });
            } catch {
                // Aula criada mas upload falhou — deixa ir para editar depois
                setFlashData({ success: 'Aula criada! Mas o upload do vídeo falhou. Tente novamente editando a aula.' });
                router.replace(`/admin/cursos/${courseID}`);
                return;
            }
        }

        setFlashData({ success: 'Aula criada com sucesso!' });
        router.replace(`/admin/cursos/${courseID}`);
    }
    // ===========================================================================
    return (
        <Formik
            initialValues={{ title: '', duration: '', order: '' }}
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
            {({ handleChange, handleSubmit, isSubmitting, isValid, errors }) => (
                <form>
                    <AppInput
                        placeholder="Digite o título da aula"
                        label="Título:"
                        name="title"
                        onChange={handleChange}
                        icon="ios-film"
                        error={errors.title}
                    />
                    <AppInput
                        placeholder="Duração em minutos"
                        label="Duração (min):"
                        name="duration"
                        type="number"
                        onChange={handleChange}
                        icon="clock"
                        error={errors.duration}
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

                    {/* UPLOAD DE VÍDEO */}
                    <div className="mt-4 mb-4">
                        <p className="text-sm font-medium mb-2">Vídeo da aula: <span className="text-gray-400 font-normal">(opcional — pode adicionar depois)</span></p>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="video/*"
                            className="hidden"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) setVideoFileName(file.name);
                            }}
                        />

                        <AppButton
                            title={videoFileName ? "Trocar vídeo" : "Selecionar vídeo"}
                            icon="ios-cloud-upload"
                            form="round"
                            type="outline"
                            onClick={() => fileInputRef.current?.click()}
                        />

                        {videoFileName && (
                            <p className="text-sm text-[#1aab67] mt-2">
                                <i className="ion-checkmark mr-1"/>
                                {videoFileName}
                            </p>
                        )}

                        {uploading && (
                            <div className="mt-3">
                                <p className="text-sm text-gray-500 mb-1">Enviando vídeo... {uploadProgress}%</p>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-[#4703D0] h-2 rounded-full transition-all"
                                        style={{ width: `${uploadProgress}%` }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {error && <p className="my-3 text-[tomato] text-[15px]">{error}</p>}
                    <AppButton
                        title="Criar aula"
                        icon="checkmark"
                        onClick={() => handleSubmit()}
                        disabled={!isValid || isSubmitting || uploading}
                    />
                </form>
            )}
        </Formik>
    )
}