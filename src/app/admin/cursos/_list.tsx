"use client";
import { useEffect, useState } from "react";
import CourseServices from "@/services/courses";
import UserServices from "@/services/user";
import Link from "next/link";
import { AppButton, AppInput, AppLoader, AppModal, AppSelect } from "@/themes/components";
import { getFlashData } from "@/helpers/router";
import { Course } from "@/types/course";

const STATUS_LABEL: Record<string, string> = {
    draft:     'Rascunho',
    published: 'Publicado',
};

export default function CourseList() {

    const [courses, setCourses] = useState<Course[]>([]);
    const [courseRemove, setCourseRemove] = useState<Course | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState<any>(null);
    const [filter, setFilter] = useState({
        title: '',
        status: '-1',
        verified: '-1',
    });

    const session = UserServices.getCurrentUser();

    // ======================================================================
    const getCourses = async (p: number) => {
        if (!session) return;
        setLoading(true);
        const { success, courses, pagination } = await CourseServices.getAll(session, p, filter);
        if (success && courses) {
            setCourses(courses);
            setPagination(pagination);
        }
        setLoading(false);
    }
    // -----------
    const handleRemove = (course: Course) => {
        setCourseRemove(course);
        setSuccess(null);
        setError(null);
    }
    // -----------
    const handleModalConfirm = async () => {
        if (!courseRemove) return;
        setLoading(true);
        setCourseRemove(null);
        const { success, error } = await CourseServices.delete(courseRemove.id);
        if (success) setSuccess('Curso excluído com sucesso!');
        else setError(error ?? 'Erro ao excluir curso.');
        getCourses(1);
    }
    // -----------
    const handleToggleStatus = async (course: Course) => {
        const newStatus = course.status === 'draft' ? 'published' : 'draft';
        const { success, error } = await CourseServices.toggleStatus(course.id, newStatus);
        if (success) {
            setSuccess(`Curso ${newStatus === 'published' ? 'publicado' : 'despublicado'} com sucesso!`);
            getCourses(page);
        } else {
            setError(error ?? 'Erro ao atualizar status.');
        }
    }
    // -----------
    const handleToggleVerified = async (course: Course) => {
        if (!session) return;
        const { success, error } = course.verified
            ? await CourseServices.removeVerification(course.id)
            : await CourseServices.approve(course.id, session);
        if (success) {
            setSuccess(`Selo ${course.verified ? 'removido' : 'aprovado'} com sucesso!`);
            getCourses(page);
        } else {
            setError(error ?? 'Erro ao atualizar verificação.');
        }
    }
    // -----------
    const handlePage = (newPage: number) => {
        setPage(newPage);
        getCourses(newPage);
    }
    // -----------
    useEffect(() => {
        getCourses(page);
        (() => {
            const data = getFlashData();
            if (data?.success) setSuccess(data.success);
            if (data?.error) setError(data.error);
        })();
    }, []);
    // ======================================================================
    return (
        <>
            {/* FILTROS */}
            <h3 className="text-[18px] font-bold mt-4">Filtros</h3>
            <div className="flex flex-col border-b-[2px] border-[#dedede] p-2">
                <div className="flex gap-2 flex-wrap">
                    <AppInput
                        type="text"
                        label="Título"
                        value={filter.title}
                        onChange={(e) => setFilter({ ...filter, title: e.target.value })}
                    />
                    <AppSelect
                        label="Status"
                        value={filter.status}
                        onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                    >
                        <option value="-1">Todos</option>
                        <option value="draft">Rascunho</option>
                        <option value="published">Publicado</option>
                    </AppSelect>
                    {/* Filtro de verificado apenas para admins */}
                    {session?.role === 'admin' && (
                        <AppSelect
                            label="Verificado"
                            value={filter.verified}
                            onChange={(e) => setFilter({ ...filter, verified: e.target.value })}
                        >
                            <option value="-1">Todos</option>
                            <option value="1">Sim</option>
                            <option value="0">Não</option>
                        </AppSelect>
                    )}
                </div>
                <AppButton title="Filtrar" className="w-[100px]" type="outline" onClick={() => getCourses(page)} />
            </div>

            {success && <p className="bg-[#7fc545] px-5 text-center rounded-full p-1 mt-2">{success}</p>}
            {error   && <p className="bg-[tomato]  px-5 text-center rounded-full p-1 mt-2">{error}</p>}

            {loading && <div className="flex justify-center mt-5"><AppLoader size={50} /></div>}

            {!loading && (
                <div className="overflow-x-auto mt-3">
                    <table className="min-w-full bg-white">
                        <thead>
                            <tr>
                                <th className="py-2 px-4 border-b border-gray-200 text-left text-sm font-semibold text-gray-600">Título</th>
                                <th className="py-2 px-4 border-b border-gray-200 text-left text-sm font-semibold text-gray-600">Autor</th>
                                <th className="py-2 px-4 border-b border-gray-200 text-left text-sm font-semibold text-gray-600">Status</th>
                                <th className="py-2 px-4 border-b border-gray-200 text-left text-sm font-semibold text-gray-600">Verificado</th>
                                <th className="py-2 px-4 border-b border-gray-200 text-left text-sm font-semibold text-gray-600">Duração</th>
                                <th className="py-2 px-4 border-b border-gray-200 text-left text-sm font-semibold text-gray-600">Certificado</th>
                                <th className="py-2 px-4 border-b border-gray-200 text-left text-sm font-semibold text-gray-600">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {courses.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="py-4 text-center text-sm text-gray-400">
                                        Nenhum curso encontrado.
                                    </td>
                                </tr>
                            )}
                            {courses.map(course => (
                                <tr key={course.id}>
                                    <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{course.title}</td>
                                    <td className="py-2 px-4 border-b border-gray-200 text-sm">{course.authorName}</td>
                                    <td className="py-2 px-4 border-b border-gray-200 text-sm">{STATUS_LABEL[course.status] ?? course.status}</td>
                                    <td className="py-2 px-4 border-b border-gray-200 text-sm">
                                        {course.verified
                                            ? <span className="text-[#1aab67] font-bold">✓ Verificado</span>
                                            : <span className="text-gray-400">Não</span>
                                        }
                                    </td>
                                    <td className="py-2 px-4 border-b border-gray-200 text-sm">{course.duration}h</td>
                                    <td className="py-2 px-4 border-b border-gray-200 text-sm">{course.hasCertificate ? 'Sim' : 'Não'}</td>
                                    <td className="py-2 px-4 border-b border-gray-200 text-sm">
                                        {/* Ver detalhes / módulos */}
                                        <Link href={`/admin/cursos/${course.id}`}>
                                            <i className="ion-eye text-[20px] text-[#4703D0] mx-[10px] cursor-pointer" title="Ver detalhes" />
                                        </Link>
                                        {/* Editar */}
                                        <Link href={`/admin/cursos/${course.id}/editar`}>
                                            <i className="ion-edit text-[20px] text-[#1aab67] mx-[10px] cursor-pointer" title="Editar" />
                                        </Link>
                                        {/* Publicar / Despublicar */}
                                        <i
                                            className={`ion-power text-[20px] mx-[10px] cursor-pointer ${course.status === 'published' ? 'text-[orange]' : 'text-[#1aab67]'}`}
                                            title={course.status === 'published' ? 'Despublicar' : 'Publicar'}
                                            onClick={() => handleToggleStatus(course)}
                                        />
                                        {/* Aprovar / Remover selo — apenas admin */}
                                        {session?.role === 'admin' && (
                                            <i
                                                className={`ion-ribbon text-[20px] mx-[10px] cursor-pointer ${course.verified ? 'text-[orange]' : 'text-[#1aab67]'}`}
                                                title={course.verified ? 'Remover verificação' : 'Verificar curso'}
                                                onClick={() => handleToggleVerified(course)}
                                            />
                                        )}
                                        {/* Excluir */}
                                        <i
                                            className="ion-ios-trash text-[20px] text-[#ed1b2d] mx-[10px] cursor-pointer"
                                            title="Excluir"
                                            onClick={() => handleRemove(course)}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {pagination && (
                        <div className="flex justify-end mt-[20px]">
                            {!pagination.firstPage && (
                                <AppButton title="Anterior" className="mr-[10px]" icon="arrow-left-a" form="round" onClick={() => handlePage(page - 1)} />
                            )}
                            {!pagination.lastPage && (
                                <AppButton title="Próximo" className="ml-[10px]" icon="arrow-right-a" form="round" onClick={() => handlePage(page + 1)} />
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* MODAL — confirmar exclusão */}
            {courseRemove && (
                <AppModal title="Excluir curso">
                    <p>Deseja realmente excluir o curso <strong>{courseRemove.title}</strong>?</p>
                    <p className="text-sm text-gray-500 mt-1">Esta ação não pode ser desfeita.</p>
                    <div className="flex justify-between p-[20px]">
                        <AppButton title="Sim, excluir" icon="checkmark" form="round" color="#ed1b2d" onClick={handleModalConfirm} />
                        <AppButton title="Cancelar" icon="close" color="tomato" form="round" onClick={() => setCourseRemove(null)} />
                    </div>
                </AppModal>
            )}
        </>
    );
}