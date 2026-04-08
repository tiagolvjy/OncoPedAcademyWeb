"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import QuestionnaireServices from "@/services/questionnaires";
import { AppButton, AppLoader, AppModal } from "@/themes/components";
import { setFlashData } from "@/helpers/router";
import { Questionnaire, Question, QuestionnaireStatus } from "@/types/questionnaire";

const TYPE_LABEL: Record<string, string> = {
    leveling:     'Nivelamento Geral',
    pre_content:  'Pré-conteúdo',
    post_content: 'Pós-conteúdo',
};

const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E', 'F'];

export default function QuestionnaireDetails({ questionnaireID }: { questionnaireID: string }) {

    const router = useRouter();

    const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [questionToDelete, setQuestionToDelete] = useState<Question | null>(null);
    const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);

    // ======================================================================
    const loadQuestionnaire = async () => {
        const { success, questionnaire } = await QuestionnaireServices.getById(questionnaireID);
        if (!success || !questionnaire) {
            setFlashData({ error: 'Questionário não encontrado.' });
            router.replace('/admin/questionarios');
            return;
        }
        setQuestionnaire(questionnaire);
    }
    // -----------
    const loadQuestions = async () => {
        const { success, questions } = await QuestionnaireServices.getQuestions(questionnaireID);
        if (success && questions) setQuestions(questions);
    }
    // -----------
    const init = async () => {
        setLoading(true);
        await loadQuestionnaire();
        await loadQuestions();
        setLoading(false);
    }
    // ======================================================================
    const handleToggleStatus = async () => {
        if (!questionnaire) return;
        const newStatus: QuestionnaireStatus = questionnaire.status === 'active' ? 'inactive' : 'active';
        const { success, error } = await QuestionnaireServices.toggleStatus(questionnaireID, newStatus);
        if (success) {
            setSuccess(`Questionário ${newStatus === 'active' ? 'ativado' : 'desativado'} com sucesso!`);
            setQuestionnaire({ ...questionnaire, status: newStatus });
        } else setError(error ?? 'Erro ao atualizar status.');
    }
    // -----------
    const handleDeleteQuestionnaire = async () => {
        const { success, error } = await QuestionnaireServices.delete(questionnaireID);
        if (success) {
            setFlashData({ success: 'Questionário excluído com sucesso!' });
            router.replace('/admin/questionarios');
        } else setError(error ?? 'Erro ao excluir questionário.');
    }
    // -----------
    const handleDeleteQuestion = async () => {
        if (!questionToDelete) return;
        const { success, error } = await QuestionnaireServices.deleteQuestion(questionnaireID, questionToDelete.id);
        setQuestionToDelete(null);
        if (success) {
            setSuccess('Questão excluída com sucesso!');
            await loadQuestions();
        } else setError(error ?? 'Erro ao excluir questão.');
    }
    // ======================================================================
    useEffect(() => { init(); }, []);
    // ======================================================================

    if (loading) return <div className="flex justify-center mt-10"><AppLoader size={50} /></div>;
    if (!questionnaire) return null;

    return (
        <>
            {success && <p className="bg-[#7fc545] px-5 text-center rounded-full p-1 mb-3">{success}</p>}
            {error   && <p className="bg-[tomato]  px-5 text-center rounded-full p-1 mb-3">{error}</p>}

            {/* INFORMAÇÕES DO QUESTIONÁRIO */}
            <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
                <div className="flex justify-between items-start flex-wrap gap-3">
                    <div>
                        <h2 className="text-[22px] font-bold">{questionnaire.title}</h2>
                        <p className="text-gray-500 text-sm mt-1">{TYPE_LABEL[questionnaire.type]}</p>
                        {questionnaire.courseTitle && (
                            <p className="text-gray-500 text-sm">Curso: {questionnaire.courseTitle}</p>
                        )}
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        <AppButton title="Voltar" icon="arrow-left-a" form="round" type="outline" href="/admin/questionarios" />
                        <AppButton
                            title="Editar"
                            icon="edit"
                            form="round"
                            type="outline"
                            href={`/admin/questionarios/${questionnaireID}/editar`}
                        />
                        <AppButton
                            title={questionnaire.status === 'active' ? 'Desativar' : 'Ativar'}
                            icon="power"
                            form="round"
                            color={questionnaire.status === 'active' ? 'orange' : '#1aab67'}
                            onClick={handleToggleStatus}
                        />
                        <AppButton
                            title="Excluir"
                            icon="ios-trash"
                            form="round"
                            color="#ed1b2d"
                            onClick={() => setConfirmDelete(true)}
                        />
                    </div>
                </div>

                {/* Detalhes */}
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-50 rounded p-3 text-center">
                        <p className="text-xs text-gray-500">Status</p>
                        <p className={`font-bold ${questionnaire.status === 'active' ? 'text-[#1aab67]' : 'text-gray-400'}`}>
                            {questionnaire.status === 'active' ? 'Ativo' : 'Inativo'}
                        </p>
                    </div>
                    <div className="bg-gray-50 rounded p-3 text-center">
                        <p className="text-xs text-gray-500">Questões</p>
                        <p className="font-bold">{questions.length}</p>
                    </div>
                    <div className="bg-gray-50 rounded p-3 text-center">
                        <p className="text-xs text-gray-500">Tempo limite</p>
                        <p className="font-bold">{questionnaire.timeLimit ? `${questionnaire.timeLimit} min` : '—'}</p>
                    </div>
                    <div className="bg-gray-50 rounded p-3 text-center">
                        <p className="text-xs text-gray-500">Nota mínima</p>
                        <p className="font-bold">{questionnaire.passingScore ? `${questionnaire.passingScore}%` : '—'}</p>
                    </div>
                </div>
            </div>

            {/* QUESTÕES */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-[18px] font-bold">Questões</h3>
                    <AppButton
                        title="Nova questão"
                        icon="plus"
                        form="round"
                        type="outline"
                        href={`/admin/questionarios/${questionnaireID}/questoes/novo`}
                    />
                </div>

                {questions.length === 0 && (
                    <p className="text-center text-gray-400 text-sm py-4">Nenhuma questão cadastrada ainda.</p>
                )}

                {questions.map((question, index) => (
                    <div key={question.id} className="border border-gray-200 rounded-lg mb-3">
                        {/* CABEÇALHO DA QUESTÃO */}
                        <div
                            className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50"
                            onClick={() => setExpandedQuestion(expandedQuestion === question.id ? null : question.id)}
                        >
                            <div className="flex items-center gap-3">
                                <span className="bg-gray-200 text-gray-600 rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold">
                                    {index + 1}
                                </span>
                                <span className="font-medium text-sm">{question.text}</span>
                            </div>
                            <div className="flex items-center gap-3" onClick={e => e.stopPropagation()}>
                                <Link href={`/admin/questionarios/${questionnaireID}/questoes/${question.id}/editar`}>
                                    <i className="ion-edit text-[18px] text-[#1aab67] cursor-pointer" />
                                </Link>
                                <i
                                    className="ion-ios-trash text-[18px] text-[#ed1b2d] cursor-pointer"
                                    onClick={() => setQuestionToDelete(question)}
                                />
                                <i className={`ion-chevron-${expandedQuestion === question.id ? 'up' : 'down'} text-[18px] text-gray-400`} />
                            </div>
                        </div>

                        {/* ALTERNATIVAS */}
                        {expandedQuestion === question.id && (
                            <div className="border-t border-gray-200 p-4">
                                {question.imageURL && (
                                    <img src={question.imageURL} alt="Imagem da questão" className="max-w-[300px] rounded mb-3" />
                                )}
                                <div className="flex flex-col gap-2">
                                    {question.options.map((option, i) => (
                                        <div
                                            key={option.id}
                                            className={`flex items-center gap-3 p-2 rounded ${option.isCorrect ? 'bg-[#efffef] border border-[#1aab67]' : 'bg-gray-50'}`}
                                        >
                                            <span className={`font-bold text-sm w-6 ${option.isCorrect ? 'text-[#1aab67]' : 'text-gray-500'}`}>
                                                {OPTION_LABELS[i]}
                                            </span>
                                            <span className="text-sm">{option.text}</span>
                                            {option.isCorrect && (
                                                <span className="ml-auto text-[#1aab67] text-xs font-bold">✓ Correta</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* MODAL — excluir questionário */}
            {confirmDelete && (
                <AppModal title="Excluir questionário">
                    <p>Deseja realmente excluir o questionário <strong>{questionnaire.title}</strong>?</p>
                    <p className="text-sm text-gray-500 mt-1">Todas as questões serão excluídas. Esta ação não pode ser desfeita.</p>
                    <div className="flex justify-between p-[20px]">
                        <AppButton title="Sim, excluir" icon="checkmark" form="round" color="#ed1b2d" onClick={handleDeleteQuestionnaire} />
                        <AppButton title="Cancelar" icon="close" color="tomato" form="round" onClick={() => setConfirmDelete(false)} />
                    </div>
                </AppModal>
            )}

            {/* MODAL — excluir questão */}
            {questionToDelete && (
                <AppModal title="Excluir questão">
                    <p>Deseja realmente excluir esta questão?</p>
                    <p className="text-sm text-gray-500 mt-1 truncate">{questionToDelete.text}</p>
                    <div className="flex justify-between p-[20px]">
                        <AppButton title="Sim, excluir" icon="checkmark" form="round" color="#ed1b2d" onClick={handleDeleteQuestion} />
                        <AppButton title="Cancelar" icon="close" color="tomato" form="round" onClick={() => setQuestionToDelete(null)} />
                    </div>
                </AppModal>
            )}
        </>
    );
}