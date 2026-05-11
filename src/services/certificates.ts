import {
    collection,
    doc,
    getDocs,
    getDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    startAfter,
    DocumentSnapshot,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Certificate } from '@/types/certificate';
import { UserSession } from '@/types/user';

const COLLECTION = 'certificates';
const PAGE_SIZE = 10;

const CertificateServices = {

    /**
     * Retorna lista paginada de certificados
     * Admin vê todos, médico vê apenas dos próprios cursos
     */
    getAll: async (
        session: UserSession,
        page: number,
        filter: { userName?: string; courseTitle?: string } = {},
    ): Promise<{ success: boolean; certificates?: Certificate[]; pagination?: any }> => {
        try {
            const snapshot = await getDocs(collection(db, COLLECTION));
            let certificates = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Certificate));

            // Médico só vê certificados dos próprios cursos
            if (session.role === 'doctor')
                certificates = certificates.filter(c => c.authorId === session.uid);

            if (filter.userName)
                certificates = certificates.filter(c => c.userName.toLowerCase().includes(filter.userName!.toLowerCase()));

            if (filter.courseTitle)
                certificates = certificates.filter(c => c.courseTitle.toLowerCase().includes(filter.courseTitle!.toLowerCase()));

            // Ordenar por data de emissão desc
            certificates.sort((a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime());

            const total = certificates.length;
            const start = (page - 1) * PAGE_SIZE;
            const paginated = certificates.slice(start, start + PAGE_SIZE);

            return {
                success: true,
                certificates: paginated,
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
     * Retorna um certificado pelo ID
     */
    getById: async (id: string): Promise<{ success: boolean; certificate?: Certificate }> => {
        try {
            const snap = await getDoc(doc(db, COLLECTION, id));
            if (!snap.exists()) return { success: false };
            return { success: true, certificate: { id: snap.id, ...snap.data() } as Certificate };
        } catch {
            return { success: false };
        }
    },

    /**
     * Remove um certificado (apenas admin)
     */
    delete: async (id: string): Promise<{ success: boolean; error?: string }> => {
        try {
            await deleteDoc(doc(db, COLLECTION, id));
            return { success: true };
        } catch {
            return { success: false, error: 'Erro ao remover certificado.' };
        }
    },
};

export default CertificateServices;