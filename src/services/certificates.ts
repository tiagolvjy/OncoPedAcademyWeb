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
        lastDoc?: DocumentSnapshot
    ): Promise<{ success: boolean; certificates?: Certificate[]; pagination?: any }> => {
        try {
            let q = query(collection(db, COLLECTION), orderBy('issuedAt', 'desc'), limit(PAGE_SIZE));

            // Médico só vê certificados dos próprios cursos
            if (session.role === 'doctor')
                q = query(q, where('authorId', '==', session.uid));

            if (page > 1 && lastDoc)
                q = query(q, startAfter(lastDoc));

            const snapshot = await getDocs(q);
            const certificates = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Certificate));

            // Filtros client-side
            const filtered = certificates.filter(c => {
                if (filter.userName && !c.userName.toLowerCase().includes(filter.userName.toLowerCase()))
                    return false;
                if (filter.courseTitle && !c.courseTitle.toLowerCase().includes(filter.courseTitle.toLowerCase()))
                    return false;
                return true;
            });

            return {
                success: true,
                certificates: filtered,
                pagination: {
                    firstPage: page === 1,
                    lastPage: snapshot.docs.length < PAGE_SIZE,
                    lastDoc: snapshot.docs[snapshot.docs.length - 1],
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