import {
    collection,
    doc,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    startAfter,
    DocumentSnapshot,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Questionnaire, QuestionnaireStatus, QuestionnaireType, Question } from '@/types/questionnaire';
import { UserSession } from '@/types/user';

const COLLECTION = 'questionnaires';
const PAGE_SIZE = 10;

const QuestionnaireServices = {

    /**
     * Retorna lista paginada de questionários com filtros
     */
    getAll: async (
        session: UserSession,
        page: number,
        filter: { title?: string; type?: string; status?: string } = {},
    ): Promise<{ success: boolean; questionnaires?: Questionnaire[]; pagination?: any }> => {
        try {
            const snapshot = await getDocs(collection(db, COLLECTION));
            let questionnaires = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Questionnaire));

            if (session.role === 'doctor')
                questionnaires = questionnaires.filter(q => q.authorId === session.uid);

            if (filter.type && filter.type !== '-1')
                questionnaires = questionnaires.filter(q => q.type === filter.type);

            if (filter.status && filter.status !== '-1')
                questionnaires = questionnaires.filter(q => q.status === filter.status);

            if (filter.title)
                questionnaires = questionnaires.filter(q => q.title.toLowerCase().includes(filter.title!.toLowerCase()));

            // Ordenar por data de criação desc
            questionnaires.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

            const total = questionnaires.length;
            const start = (page - 1) * PAGE_SIZE;
            const paginated = questionnaires.slice(start, start + PAGE_SIZE);

            return {
                success: true,
                questionnaires: paginated,
                pagination: {
                    firstPage: page === 1,
                    lastPage: start + PAGE_SIZE >= total,
                }
            };
        } catch (error) {
            console.error(error);
            return { success: false };
        }
    },

    /**
     * Retorna um questionário pelo ID
     */
    getById: async (id: string): Promise<{ success: boolean; questionnaire?: Questionnaire }> => {
        try {
            const snap = await getDoc(doc(db, COLLECTION, id));
            if (!snap.exists()) return { success: false };
            return { success: true, questionnaire: { id: snap.id, ...snap.data() } as Questionnaire };
        } catch {
            return { success: false };
        }
    },

    /**
     * Cria um questionário
     */
    create: async (
        session: UserSession,
        data: Pick<Questionnaire, 'title' | 'type' | 'timeLimit' | 'passingScore'> & {
            courseId?: string;
            courseTitle?: string;
        }
    ): Promise<{ success: boolean; id?: string; error?: string }> => {
        try {
            const ref = await addDoc(collection(db, COLLECTION), {
                ...data,
                authorId: session.uid,
                courseId: data.courseId ?? null,
                courseTitle: data.courseTitle ?? null,
                timeLimit: data.timeLimit ?? null,
                passingScore: data.passingScore ?? null,
                status: 'active' as QuestionnaireStatus,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });
            return { success: true, id: ref.id };
        } catch {
            return { success: false, error: 'Erro ao criar questionário.' };
        }
    },

    /**
     * Atualiza um questionário
     */
        update: async (
            id: string,
            data: Partial<Pick<Questionnaire, 'title' | 'type' | 'status'>> & {
                courseId?: string | null;
                courseTitle?: string | null;
                timeLimit?: number | null;
                passingScore?: number | null;
            }
        ): Promise<{ success: boolean; error?: string }> => {
        try {
            await updateDoc(doc(db, COLLECTION, id), {
                ...data,
                updatedAt: new Date().toISOString(),
            });
            return { success: true };
        } catch {
            return { success: false, error: 'Erro ao atualizar questionário.' };
        }
    },

    /**
     * Ativa ou desativa questionário
     */
    toggleStatus: async (
        id: string,
        status: QuestionnaireStatus
    ): Promise<{ success: boolean; error?: string }> => {
        try {
            await updateDoc(doc(db, COLLECTION, id), {
                status,
                updatedAt: new Date().toISOString(),
            });
            return { success: true };
        } catch {
            return { success: false, error: 'Erro ao atualizar status.' };
        }
    },

    /**
     * Exclui um questionário
     */
    delete: async (id: string): Promise<{ success: boolean; error?: string }> => {
        try {
            await deleteDoc(doc(db, COLLECTION, id));
            return { success: true };
        } catch {
            return { success: false, error: 'Erro ao excluir questionário.' };
        }
    },

    // =========================================================
    // QUESTÕES
    // =========================================================

    getQuestions: async (
        questionnaireId: string
    ): Promise<{ success: boolean; questions?: Question[] }> => {
        try {
            const q = query(
                collection(db, COLLECTION, questionnaireId, 'questions'),
                orderBy('order', 'asc')
            );
            const snapshot = await getDocs(q);
            const questions = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Question));
            return { success: true, questions };
        } catch {
            return { success: false };
        }
    },

    createQuestion: async (
        questionnaireId: string,
        data: Omit<Question, 'id'>
    ): Promise<{ success: boolean; id?: string; error?: string }> => {
        try {
            const ref = await addDoc(
                collection(db, COLLECTION, questionnaireId, 'questions'),
                {
                    ...data,
                    imageURL: data.imageURL ?? null,
                }
            );
            return { success: true, id: ref.id };
        } catch {
            return { success: false, error: 'Erro ao criar questão.' };
        }
    },

    updateQuestion: async (
        questionnaireId: string,
        questionId: string,
        data: Partial<Omit<Question, 'id'>>
    ): Promise<{ success: boolean; error?: string }> => {
        try {
            await updateDoc(
                doc(db, COLLECTION, questionnaireId, 'questions', questionId),
                data
            );
            return { success: true };
        } catch {
            return { success: false, error: 'Erro ao atualizar questão.' };
        }
    },

    deleteQuestion: async (
        questionnaireId: string,
        questionId: string
    ): Promise<{ success: boolean; error?: string }> => {
        try {
            await deleteDoc(
                doc(db, COLLECTION, questionnaireId, 'questions', questionId)
            );
            return { success: true };
        } catch {
            return { success: false, error: 'Erro ao excluir questão.' };
        }
    },
};

export default QuestionnaireServices;