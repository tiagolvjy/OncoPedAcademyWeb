"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import CourseServices from "@/services/courses";
import UserServices from "@/services/user";
import { AppButton, AppLoader, AppModal } from "@/themes/components";
import { setFlashData } from "@/helpers/router";
import { Course, Module, Lesson } from "@/types/course";

export default function CourseDetails({ courseID }: { courseID: string }) {

    const router = useRouter();
    const session = UserServices.getCurrentUser();

    const [course, setCourse] = useState<Course | null>(null);
    const [modules, setModules] = useState<Module[]>([]);
    const [lessons, setLessons] = useState<Record<string, Lesson[]>>({});
    const [expandedModule, setExpandedModule] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Modais
    const [moduleToDelete, setModuleToDelete] = useState<Module | null>(null);
    const [lessonToDelete, setLessonToDelete] = useState<{ lesson: Lesson; moduleId: string } | null>(null);
    const [confirmDelete, setConfirmDelete] = useState(false);

    // ======================================================================
    const loadCourse = async () => {
        const { success, course } = await CourseServices.getById(courseID);
        if (!success || !course) {
            setFlashData({ error: 'Curso não encontrado.' });
            router.replace('/admin/cursos');
            return;
        }
        // Verifica permissão
        if (session?.role === 'doctor' && course.authorId !== session.uid) {
            setFlashData({ error: 'Sem permissão para visualizar este curso.' });
            router.replace('/admin/cursos');
            return;
        }
        setCourse(course);
    }
    // -----------
    const loadModules = async () => {
        const { success, modules } = await CourseServices.getModules(courseID);
        if (success && modules) setModules(modules);
    }
    // -----------
    const loadLessons = async (moduleId: string) => {
        if (lessons[moduleId]) return; // já carregado
        const { success, lessons: data } = await CourseServices.getLessons(courseID, moduleId);
        if (success && data) setLessons(prev => ({ ...prev, [moduleId]: data }));
    }
    // -----------
    const init = async () => {
        setLoading(true);
        await loadCourse();
        await loadModules();
        setLoading(false);
    }
    // ======================================================================
    const handleToggleStatus = async () => {
        if (!course) return;
        const newStatus = course.status === 'draft' ? 'published' : 'draft';
        const { success, error } = await CourseServices.toggleStatus(courseID, newStatus);
        if (success) {
            setSuccess(`Curso ${newStatus === 'published' ? 'publicado' : 'despublicado'} com sucesso!`);
            setCourse({ ...course, status: newStatus });
        } else setError(error ?? 'Erro ao atualizar status.');
    }
    // -----------
    const handleToggleVerified = async () => {
        if (!course || !session) return;
        const { success, error } = course.verified
            ? await CourseServices.removeVerification(courseID)
            : await CourseServices.approve(courseID, session);
        if (success) {
            setSuccess(`Selo ${course.verified ? 'removido' : 'aprovado'} com sucesso!`);
            setCourse({ ...course, verified: !course.verified });
        } else setError(error ?? 'Erro ao atualizar verificação.');
    }
    // -----------
    const handleDeleteCourse = async () => {
        const { success, error } = await CourseServices.delete(courseID);
        if (success) {
            setFlashData({ success: 'Curso excluído com sucesso!' });
            router.replace('/admin/cursos');
        } else setError(error ?? 'Erro ao excluir curso.');
    }
    // -----------
    const handleDeleteModule = async () => {
        if (!moduleToDelete) return;
        const { success, error } = await CourseServices.deleteModule(courseID, moduleToDelete.id);
        setModuleToDelete(null);
        if (success) {
            setSuccess('Módulo excluído com sucesso!');
            await loadModules();
        } else setError(error ?? 'Erro ao excluir módulo.');
    }
    // -----------
    const handleDeleteLesson = async () => {
        if (!lessonToDelete) return;
        const { success, error } = await CourseServices.deleteLesson(courseID, lessonToDelete.moduleId, lessonToDelete.lesson.id);
        setLessonToDelete(null);
        if (success) {
            setSuccess('Aula excluída com sucesso!');
            // Recarrega aulas do módulo
            setLessons(prev => {
                const updated = { ...prev };
                delete updated[lessonToDelete.moduleId];
                return updated;
            });
            await loadLessons(lessonToDelete.moduleId);
        } else setError(error ?? 'Erro ao excluir aula.');
    }
    // -----------
    const handleExpandModule = async (moduleId: string) => {
        const isExpanding = expandedModule !== moduleId;
        setExpandedModule(isExpanding ? moduleId : null);
        if (isExpanding) await loadLessons(moduleId);
    }
    // ======================================================================
    useEffect(() => { init(); }, []);
    // ======================================================================

    if (loading) return <div className="flex justify-center mt-10"><AppLoader size={50} /></div>;
    if (!course) return null;

    const canEdit = session?.role === 'admin' || course.authorId === session?.uid;

    return (
        <>
            {success && <p className="bg-[#7fc545] px-5 text-center rounded-full p-1 mb-3">{success}</p>}
            {error   && <p className="bg-[tomato]  px-5 text-center rounded-full p-1 mb-3">{error}</p>}

            {/* INFORMAÇÕES DO CURSO */}
            <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
                <div className="flex justify-between items-start flex-wrap gap-3">
                    <div>
                        <h2 className="text-[22px] font-bold">{course.title}</h2>
                        <p className="text-gray-500 text-sm mt-1">por {course.authorName}</p>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        {/* Voltar */}
                        <AppButton title="Voltar" icon="arrow-left-a" form="round" type="outline" href="/admin/cursos" />
                        {canEdit && (
                            <>
                                {/* Editar */}
                                <AppButton title="Editar" icon="edit" form="round" type="outline" href={`/admin/cursos/${courseID}/editar`} />
                                {/* Publicar / Despublicar */}
                                <AppButton
                                    title={course.status === 'published' ? 'Despublicar' : 'Publicar'}
                                    icon="power"
                                    form="round"
                                    color={course.status === 'published' ? 'orange' : '#1aab67'}
                                    onClick={handleToggleStatus}
                                />
                            </>
                        )}
                        {/* Aprovar selo — apenas admin */}
                        {session?.role === 'admin' && (
                            <AppButton
                                title={course.verified ? 'Remover selo' : 'Aprovar selo'}
                                icon="ribbon-a"
                                form="round"
                                color={course.verified ? 'orange' : '#4703D0'}
                                onClick={handleToggleVerified}
                            />
                        )}
                        {/* Excluir — apenas admin ou dono */}
                        {canEdit && (
                            <AppButton
                                title="Excluir curso"
                                icon="ios-trash"
                                form="round"
                                color="#ed1b2d"
                                onClick={() => setConfirmDelete(true)}
                            />
                        )}
                    </div>
                </div>

                {/* Detalhes */}
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-50 rounded p-3 text-center">
                        <p className="text-xs text-gray-500">Status</p>
                        <p className="font-bold">{course.status === 'published' ? 'Publicado' : 'Rascunho'}</p>
                    </div>
                    <div className="bg-gray-50 rounded p-3 text-center">
                        <p className="text-xs text-gray-500">Verificado</p>
                        <p className={`font-bold ${course.verified ? 'text-[#1aab67]' : 'text-gray-400'}`}>
                            {course.verified ? '✓ Sim' : 'Não'}
                        </p>
                    </div>
                    <div className="bg-gray-50 rounded p-3 text-center">
                        <p className="text-xs text-gray-500">Duração</p>
                        <p className="font-bold">{course.duration}h</p>
                    </div>
                    <div className="bg-gray-50 rounded p-3 text-center">
                        <p className="text-xs text-gray-500">Certificado</p>
                        <p className="font-bold">{course.hasCertificate ? 'Sim' : 'Não'}</p>
                    </div>
                </div>

                <div className="mt-4">
                    <p className="text-xs text-gray-500 mb-1">Descrição</p>
                    <p className="text-sm">{course.description}</p>
                </div>
            </div>

            {/* MÓDULOS */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-[18px] font-bold">Módulos</h3>
                    {canEdit && (
                        <AppButton
                            title="Novo módulo"
                            icon="plus"
                            form="round"
                            type="outline"
                            href={`/admin/cursos/${courseID}/modulos/novo`}
                        />
                    )}
                </div>

                {modules.length === 0 && (
                    <p className="text-center text-gray-400 text-sm py-4">Nenhum módulo cadastrado ainda.</p>
                )}

                {modules.map((module, index) => (
                    <div key={module.id} className="border border-gray-200 rounded-lg mb-3">
                        {/* CABEÇALHO DO MÓDULO */}
                        <div
                            className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50"
                            onClick={() => handleExpandModule(module.id)}
                        >
                            <div className="flex items-center gap-3">
                                <span className="bg-gray-200 text-gray-600 rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold">
                                    {index + 1}
                                </span>
                                <span className="font-medium">{module.title}</span>
                            </div>
                            <div className="flex items-center gap-3" onClick={e => e.stopPropagation()}>
                                {canEdit && (
                                    <>
                                        <Link href={`/admin/cursos/${courseID}/modulos/${module.id}/editar`}>
                                            <i className="ion-edit text-[18px] text-[#1aab67] cursor-pointer" />
                                        </Link>
                                        <i
                                            className="ion-ios-trash text-[18px] text-[#ed1b2d] cursor-pointer"
                                            onClick={() => setModuleToDelete(module)}
                                        />
                                    </>
                                )}
                                <i className={`ion-chevron-${expandedModule === module.id ? 'up' : 'down'} text-[18px] text-gray-400`} />
                            </div>
                        </div>

                        {/* AULAS DO MÓDULO */}
                        {expandedModule === module.id && (
                            <div className="border-t border-gray-200 p-4">
                                {canEdit && (
                                    <div className="mb-3">
                                        <AppButton
                                            title="Nova aula"
                                            icon="plus"
                                            form="round"
                                            type="outline"
                                            href={`/admin/cursos/${courseID}/modulos/${module.id}/aulas/novo`}
                                        />
                                    </div>
                                )}
                                {!lessons[module.id] && (
                                    <div className="flex justify-center py-3"><AppLoader size={30} /></div>
                                )}
                                {lessons[module.id]?.length === 0 && (
                                    <p className="text-center text-gray-400 text-sm py-2">Nenhuma aula cadastrada.</p>
                                )}
                                {lessons[module.id]?.map((lesson, lessonIndex) => (
                                    <div key={lesson.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                                        <div className="flex items-center gap-3">
                                            <span className="text-gray-400 text-sm">{lessonIndex + 1}.</span>
                                            <span className="text-sm">{lesson.title}</span>
                                            <span className="text-xs text-gray-400">{lesson.duration} min</span>
                                            {lesson.videoURL && (
                                                <span className="text-xs bg-[#4703D0] text-white px-2 py-0.5 rounded-full">
                                                    <i className="ion-play mr-1"/>vídeo
                                                </span>
                                            )}
                                        </div>
                                        {canEdit && (
                                            <div className="flex gap-3">
                                                <Link href={`/admin/cursos/${courseID}/modulos/${module.id}/aulas/${lesson.id}/editar`}>
                                                    <i className="ion-edit text-[16px] text-[#1aab67] cursor-pointer" />
                                                </Link>
                                                <i
                                                    className="ion-ios-trash text-[16px] text-[#ed1b2d] cursor-pointer"
                                                    onClick={() => setLessonToDelete({ lesson, moduleId: module.id })}
                                                />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* MODAL — excluir curso */}
            {confirmDelete && (
                <AppModal title="Excluir curso">
                    <p>Deseja realmente excluir o curso <strong>{course.title}</strong>?</p>
                    <p className="text-sm text-gray-500 mt-1">Esta ação não pode ser desfeita.</p>
                    <div className="flex justify-between p-[20px]">
                        <AppButton title="Sim, excluir" icon="checkmark" form="round" color="#ed1b2d" onClick={handleDeleteCourse} />
                        <AppButton title="Cancelar" icon="close" color="tomato" form="round" onClick={() => setConfirmDelete(false)} />
                    </div>
                </AppModal>
            )}

            {/* MODAL — excluir módulo */}
            {moduleToDelete && (
                <AppModal title="Excluir módulo">
                    <p>Deseja realmente excluir o módulo <strong>{moduleToDelete.title}</strong>?</p>
                    <p className="text-sm text-gray-500 mt-1">Todas as aulas do módulo serão excluídas.</p>
                    <div className="flex justify-between p-[20px]">
                        <AppButton title="Sim, excluir" icon="checkmark" form="round" color="#ed1b2d" onClick={handleDeleteModule} />
                        <AppButton title="Cancelar" icon="close" color="tomato" form="round" onClick={() => setModuleToDelete(null)} />
                    </div>
                </AppModal>
            )}

            {/* MODAL — excluir aula */}
            {lessonToDelete && (
                <AppModal title="Excluir aula">
                    <p>Deseja realmente excluir a aula <strong>{lessonToDelete.lesson.title}</strong>?</p>
                    <div className="flex justify-between p-[20px]">
                        <AppButton title="Sim, excluir" icon="checkmark" form="round" color="#ed1b2d" onClick={handleDeleteLesson} />
                        <AppButton title="Cancelar" icon="close" color="tomato" form="round" onClick={() => setLessonToDelete(null)} />
                    </div>
                </AppModal>
            )}
        </>
    );
}