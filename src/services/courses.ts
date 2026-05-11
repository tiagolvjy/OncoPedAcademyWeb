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
import { Course, CourseStatus, Module, Lesson } from '@/types/course';
import { UserSession } from '@/types/user';

const COLLECTION = 'courses';
const PAGE_SIZE = 10;

const CourseServices = {

    /**
     * Retorna lista paginada de cursos
     * Admin vê todos, médico vê apenas os próprios
     */
    getAll: async (
        session: UserSession,
        page: number,
        filter: { title?: string; status?: string; verified?: string } = {},
    ): Promise<{ success: boolean; courses?: Course[]; pagination?: any }> => {
        try {
            const snapshot = await getDocs(collection(db, COLLECTION));
            let courses = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Course));

            // Médico só vê os próprios cursos
            if (session.role === 'doctor')
                courses = courses.filter(c => c.authorId === session.uid);

            if (filter.status && filter.status !== '-1')
                courses = courses.filter(c => c.status === filter.status);

            if (filter.verified && filter.verified !== '-1')
                courses = courses.filter(c => c.verified === (filter.verified === '1'));

            if (filter.title)
                courses = courses.filter(c => c.title.toLowerCase().includes(filter.title!.toLowerCase()));

            // Ordenar por data de criação desc
            courses.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

            const total = courses.length;
            const start = (page - 1) * PAGE_SIZE;
            const paginated = courses.slice(start, start + PAGE_SIZE);

            return {
                success: true,
                courses: paginated,
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
     * Retorna um curso pelo ID
     */
    getById: async (id: string): Promise<{ success: boolean; course?: Course }> => {
        try {
            const snap = await getDoc(doc(db, COLLECTION, id));
            if (!snap.exists()) return { success: false };
            return { success: true, course: { id: snap.id, ...snap.data() } as Course };
        } catch {
            return { success: false };
        }
    },

    /**
     * Cria um novo curso
     */
    create: async (
        session: UserSession,
        data: Pick<Course, 'title' | 'description' | 'hasCertificate' | 'duration'>
    ): Promise<{ success: boolean; id?: string; error?: string }> => {
        try {
            const ref = await addDoc(collection(db, COLLECTION), {
                ...data,
                authorId: session.uid,
                authorName: session.name,
                status: 'draft' as CourseStatus,
                verified: false,
                embeddingIndexed: false,
                coverImage: null,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });
            return { success: true, id: ref.id };
        } catch {
            return { success: false, error: 'Erro ao criar curso.' };
        }
    },

    /**
     * Atualiza informações gerais do curso
     */
    update: async (
        id: string,
        data: Partial<Pick<Course, 'title' | 'description' | 'hasCertificate' | 'duration' | 'coverImage'>>
    ): Promise<{ success: boolean; error?: string }> => {
        try {
            await updateDoc(doc(db, COLLECTION, id), {
                ...data,
                updatedAt: new Date().toISOString(),
            });
            return { success: true };
        } catch {
            return { success: false, error: 'Erro ao atualizar curso.' };
        }
    },

    /**
     * Publica ou volta para rascunho
     */
    toggleStatus: async (
        id: string,
        status: CourseStatus
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
     * Admin aprova o selo de verificado
     */
    approve: async (
        courseId: string,
        adminSession: UserSession
    ): Promise<{ success: boolean; error?: string }> => {
        try {
            await updateDoc(doc(db, COLLECTION, courseId), {
                verified: true,
                verifiedBy: adminSession.uid,
                verifiedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });
            return { success: true };
        } catch {
            return { success: false, error: 'Erro ao aprovar curso.' };
        }
    },

    /**
     * Admin remove o selo de verificado
     */
    removeVerification: async (
        courseId: string
    ): Promise<{ success: boolean; error?: string }> => {
        try {
            await updateDoc(doc(db, COLLECTION, courseId), {
                verified: false,
                verifiedBy: null,
                verifiedAt: null,
                updatedAt: new Date().toISOString(),
            });
            return { success: true };
        } catch {
            return { success: false, error: 'Erro ao remover verificação.' };
        }
    },

    /**
     * Exclui um curso e todos os seus módulos/aulas
     */
    delete: async (id: string): Promise<{ success: boolean; error?: string }> => {
        try {
            await deleteDoc(doc(db, COLLECTION, id));
            return { success: true };
        } catch {
            return { success: false, error: 'Erro ao excluir curso.' };
        }
    },

    // =========================================================
    // MÓDULOS
    // =========================================================

    getModules: async (courseId: string): Promise<{ success: boolean; modules?: Module[] }> => {
        try {
            const q = query(
                collection(db, COLLECTION, courseId, 'modules'),
                orderBy('order', 'asc')
            );
            const snapshot = await getDocs(q);
            const modules = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Module));
            return { success: true, modules };
        } catch {
            return { success: false };
        }
    },

    createModule: async (
        courseId: string,
        data: Pick<Module, 'title' | 'order'>
    ): Promise<{ success: boolean; id?: string; error?: string }> => {
        try {
            const ref = await addDoc(collection(db, COLLECTION, courseId, 'modules'), {
                ...data,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });
            return { success: true, id: ref.id };
        } catch {
            return { success: false, error: 'Erro ao criar módulo.' };
        }
    },

    updateModule: async (
        courseId: string,
        moduleId: string,
        data: Partial<Pick<Module, 'title' | 'order'>>
    ): Promise<{ success: boolean; error?: string }> => {
        try {
            await updateDoc(doc(db, COLLECTION, courseId, 'modules', moduleId), {
                ...data,
                updatedAt: new Date().toISOString(),
            });
            return { success: true };
        } catch {
            return { success: false, error: 'Erro ao atualizar módulo.' };
        }
    },

    deleteModule: async (
        courseId: string,
        moduleId: string
    ): Promise<{ success: boolean; error?: string }> => {
        try {
            await deleteDoc(doc(db, COLLECTION, courseId, 'modules', moduleId));
            return { success: true };
        } catch {
            return { success: false, error: 'Erro ao excluir módulo.' };
        }
    },

    // =========================================================
    // AULAS
    // =========================================================

    getLessons: async (
        courseId: string,
        moduleId: string
    ): Promise<{ success: boolean; lessons?: Lesson[] }> => {
        try {
            const q = query(
                collection(db, COLLECTION, courseId, 'modules', moduleId, 'lessons'),
                orderBy('order', 'asc')
            );
            const snapshot = await getDocs(q);
            const lessons = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Lesson));
            return { success: true, lessons };
        } catch {
            return { success: false };
        }
    },

    createLesson: async (
        courseId: string,
        moduleId: string,
        data: Pick<Lesson, 'title' | 'duration' | 'order'>
    ): Promise<{ success: boolean; id?: string; error?: string }> => {
        try {
            const ref = await addDoc(
                collection(db, COLLECTION, courseId, 'modules', moduleId, 'lessons'),
                {
                    ...data,
                    videoURL: null,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                }
            );
            return { success: true, id: ref.id };
        } catch {
            return { success: false, error: 'Erro ao criar aula.' };
        }
    },

    updateLesson: async (
        courseId: string,
        moduleId: string,
        lessonId: string,
        data: Partial<Pick<Lesson, 'title' | 'duration' | 'order' | 'videoURL'>>
    ): Promise<{ success: boolean; error?: string }> => {
        try {
            await updateDoc(
                doc(db, COLLECTION, courseId, 'modules', moduleId, 'lessons', lessonId),
                { ...data, updatedAt: new Date().toISOString() }
            );
            return { success: true };
        } catch {
            return { success: false, error: 'Erro ao atualizar aula.' };
        }
    },

    deleteLesson: async (
        courseId: string,
        moduleId: string,
        lessonId: string
    ): Promise<{ success: boolean; error?: string }> => {
        try {
            await deleteDoc(
                doc(db, COLLECTION, courseId, 'modules', moduleId, 'lessons', lessonId)
            );
            return { success: true };
        } catch {
            return { success: false, error: 'Erro ao excluir aula.' };
        }
    },
};

export default CourseServices;