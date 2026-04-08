"use client";
import { useEffect, useState } from "react";
import QuestionnaireServices from "@/services/questionnaires";
import Link from "next/link";
import { AppButton, AppInput, AppLoader, AppModal, AppSelect } from "@/themes/components";
import { getFlashData } from "@/helpers/router";
import { Questionnaire, QuestionnaireStatus } from "@/types/questionnaire";
import UserServices from "@/services/user";

const session = UserServices.getCurrentUser();

const TYPE_LABEL: Record<string, string> = {
    leveling:     'Nivelamento Geral',
    pre_content:  'Pré-conteúdo',
    post_content: 'Pós-conteúdo',
};

const STATUS_LABEL: Record<string, string> = {
    active:   'Ativo',
    inactive: 'Inativo',
};

export default function QuestionnaireList() {

    const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
    const [itemRemove, setItemRemove] = useState<Questionnaire | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState<any>(null);
    const [filter, setFilter] = useState({
        title: '',
        type: '-1',
        status: '-1',
    });

    // ======================================================================
    const getQuestionnaires = async (p: number) => {
        console.log('session', session);
        if (!session) return;
        setLoading(true);
        const { success, questionnaires, pagination } = await QuestionnaireServices.getAll(session, p, filter);
            if (success && questionnaires) {
                setQuestionnaires(questionnaires);
                setPagination(pagination);
            }
            setLoading(false);
    }
    // -----------
    const handleRemove = (item: Questionnaire) => {
        setItemRemove(item);
        setSuccess(null);
        setError(null);
    }
    // -----------
    const handleModalConfirm = async () => {
        if (!itemRemove) return;
        setLoading(true);
        setItemRemove(null);
        const { success, error } = await QuestionnaireServices.delete(itemRemove.id);
        if (success) setSuccess('Questionário excluído com sucesso!');
        else setError(error ?? 'Erro ao excluir questionário.');
        getQuestionnaires(1);
    }
    // -----------
    const handleToggleStatus = async (item: Questionnaire) => {
        const newStatus: QuestionnaireStatus = item.status === 'active' ? 'inactive' : 'active';
        const { success, error } = await QuestionnaireServices.toggleStatus(item.id, newStatus);
        if (success) {
            setSuccess(`Questionário ${newStatus === 'active' ? 'ativado' : 'desativado'} com sucesso!`);
            getQuestionnaires(page);
        } else {
            setError(error ?? 'Erro ao atualizar status.');
        }
    }
    // -----------
    const handlePage = (newPage: number) => {
        setPage(newPage);
        getQuestionnaires(newPage);
    }
    // -----------
    useEffect(() => {
        getQuestionnaires(page);
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
                        label="Tipo"
                        value={filter.type}
                        onChange={(e) => setFilter({ ...filter, type: e.target.value })}
                    >
                        <option value="-1">Todos</option>
                        <option value="leveling">Nivelamento Geral</option>
                        <option value="pre_content">Pré-conteúdo</option>
                        <option value="post_content">Pós-conteúdo</option>
                    </AppSelect>
                    <AppSelect
                        label="Status"
                        value={filter.status}
                        onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                    >
                        <option value="-1">Todos</option>
                        <option value="active">Ativo</option>
                        <option value="inactive">Inativo</option>
                    </AppSelect>
                </div>
                <AppButton title="Filtrar" className="w-[100px]" type="outline" onClick={() => getQuestionnaires(page)} />
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
                                <th className="py-2 px-4 border-b border-gray-200 text-left text-sm font-semibold text-gray-600">Tipo</th>
                                <th className="py-2 px-4 border-b border-gray-200 text-left text-sm font-semibold text-gray-600">Curso vinculado</th>
                                <th className="py-2 px-4 border-b border-gray-200 text-left text-sm font-semibold text-gray-600">Tempo limite</th>
                                <th className="py-2 px-4 border-b border-gray-200 text-left text-sm font-semibold text-gray-600">Status</th>
                                <th className="py-2 px-4 border-b border-gray-200 text-left text-sm font-semibold text-gray-600">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {questionnaires.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="py-4 text-center text-sm text-gray-400">
                                        Nenhum questionário encontrado.
                                    </td>
                                </tr>
                            )}
                            {questionnaires.map(item => (
                                <tr key={item.id} className={item.status === 'inactive' ? 'opacity-50' : ''}>
                                    <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.title}</td>
                                    <td className="py-2 px-4 border-b border-gray-200 text-sm">{TYPE_LABEL[item.type] ?? item.type}</td>
                                    <td className="py-2 px-4 border-b border-gray-200 text-sm">{item.courseTitle ?? '—'}</td>
                                    <td className="py-2 px-4 border-b border-gray-200 text-sm">{item.timeLimit ? `${item.timeLimit} min` : '—'}</td>
                                    <td className="py-2 px-4 border-b border-gray-200 text-sm">{STATUS_LABEL[item.status]}</td>
                                    <td className="py-2 px-4 border-b border-gray-200 text-sm">
                                        {/* Ver detalhes / questões */}
                                        <Link href={`/admin/questionarios/${item.id}`}>
                                            <i className="ion-eye text-[20px] text-[#4703D0] mx-[10px] cursor-pointer" title="Ver questões" />
                                        </Link>
                                        {/* Editar */}
                                        <Link href={`/admin/questionarios/${item.id}/editar`}>
                                            <i className="ion-edit text-[20px] text-[#1aab67] mx-[10px] cursor-pointer" title="Editar" />
                                        </Link>
                                        {/* Ativar / Desativar */}
                                        <i
                                            className={`ion-power text-[20px] mx-[10px] cursor-pointer ${item.status === 'active' ? 'text-[orange]' : 'text-[#1aab67]'}`}
                                            title={item.status === 'active' ? 'Desativar' : 'Ativar'}
                                            onClick={() => handleToggleStatus(item)}
                                        />
                                        {/* Excluir */}
                                        <i
                                            className="ion-ios-trash text-[20px] text-[#ed1b2d] mx-[10px] cursor-pointer"
                                            title="Excluir"
                                            onClick={() => handleRemove(item)}
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
            {itemRemove && (
                <AppModal title="Excluir questionário">
                    <p>Deseja realmente excluir o questionário <strong>{itemRemove.title}</strong>?</p>
                    <p className="text-sm text-gray-500 mt-1">Todas as questões serão excluídas. Esta ação não pode ser desfeita.</p>
                    <div className="flex justify-between p-[20px]">
                        <AppButton title="Sim, excluir" icon="checkmark" form="round" color="#ed1b2d" onClick={handleModalConfirm} />
                        <AppButton title="Cancelar" icon="close" color="tomato" form="round" onClick={() => setItemRemove(null)} />
                    </div>
                </AppModal>
            )}
        </>
    );
}