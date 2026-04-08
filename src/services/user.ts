import Cookies from 'js-cookie';
import {
    signInWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail
} from 'firebase/auth';
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
    DocumentSnapshot
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { User, UserRole, UserSession, UserStatus } from '@/types/user';

const COLLECTION = 'users';
const PAGE_SIZE = 10;

const UserServices = {
 
    /**
     * Autenticação via Firebase Auth
     */
    login: async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
        try {
            const credential = await signInWithEmailAndPassword(auth, email, password);
            const uid = credential.user.uid;

            // Busca dados completos do usuário no Firestore
            const userDoc = await getDoc(doc(db, COLLECTION, uid));

            if (!userDoc.exists()) {
                await signOut(auth);
                return { success: false, message: 'Usuário não encontrado na base de dados.' };
            }

            const userData = userDoc.data() as User;

            if (userData.status === 'inactive') {
                await signOut(auth);
                return { success: false, message: 'Conta desativada. Entre em contato com o administrador.' };
            }

            if (userData.role !== 'admin' && userData.role !== 'doctor') {
                await signOut(auth);
                return { success: false, message: 'Acesso restrito.' };
            }

            // Salva sessão leve no cookie (mesmo padrão do template)
            const session: UserSession = {
                uid,
                name: userData.name,
                email: userData.email,
                role: userData.role,
            };
            Cookies.set('user', JSON.stringify(session), { expires: 7 });

            return { success: true };
        } catch (error: any) {
            // Códigos de erro do Firebase Auth
            if (
                error.code === 'auth/user-not-found' ||
                error.code === 'auth/wrong-password' ||
                error.code === 'auth/invalid-credential'
            ) return { success: false, message: 'Email ou senha incorretos.' };

            if (error.code === 'auth/too-many-requests')
                return { success: false, message: 'Muitas tentativas. Tente novamente mais tarde.' };

            return { success: false, message: 'Erro ao realizar login.' };
        }
    },

    /**
     * Retorna a sessão do usuário autenticado pelo cookie
     */
    getCurrentUser: (): UserSession | null => {
        const user = Cookies.get('user');
        return user ? JSON.parse(user) : null;
    },

    /**
     * Envia email de redefinição de senha via Firebase Auth
     */
    resetPassword: async (email: string): Promise<{ success: boolean; message?: string }> => {
        try {
            await sendPasswordResetEmail(auth, email);
            return { success: true };
        } catch (error: any) {
            if (error.code === 'auth/user-not-found')
                return { success: false, message: 'Email não encontrado.' };
            return { success: false, message: 'Erro ao enviar email.' };
        }
    },

    /**
     * Logout do Firebase Auth e remove cookie
     */
    logout: async (): Promise<{ success: boolean }> => {
        try {
            await signOut(auth);
            Cookies.remove('user');
            return { success: true };
        } catch {
            return { success: false };
        }
    },

    /**
     * Retorna lista paginada de usuários com filtros
     */
    getAll: async (
        page: number,
        filter: { name?: string; email?: string; role?: string; status?: string } = {},
        lastDoc?: DocumentSnapshot
    ): Promise<{ success: boolean; users?: User[]; pagination?: any }> => {
        try {
            let q = query(collection(db, COLLECTION), orderBy('name'), limit(PAGE_SIZE));

            // Filtros
            if (filter.role && filter.role !== '-1')
                q = query(q, where('role', '==', filter.role));

            if (filter.status && filter.status !== '-1')
                q = query(q, where('status', '==', filter.status));

            if (page > 1 && lastDoc)
                q = query(q, startAfter(lastDoc));

            const snapshot = await getDocs(q);
            const users = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as User));

            // Filtros client-side para name/email (Firestore não faz LIKE)
            const filtered = users.filter(u => {
                if (filter.name && !u.name.toLowerCase().includes(filter.name.toLowerCase()))
                    return false;
                if (filter.email && !u.email.toLowerCase().includes(filter.email.toLowerCase()))
                    return false;
                return true;
            });

            return {
                success: true,
                users: filtered,
                pagination: {
                    firstPage: page === 1,
                    lastPage: snapshot.docs.length < PAGE_SIZE,
                    lastDoc: snapshot.docs[snapshot.docs.length - 1],
                }
            };
        } catch (error) {
            return { success: false };
        }
    },

    /**
     * Retorna um único usuário pelo ID
     */
    getById: async (id: string): Promise<{ success: boolean; user?: User }> => {
        try {
            const snap = await getDoc(doc(db, COLLECTION, id));
            if (!snap.exists()) return { success: false };
            return { success: true, user: { id: snap.id, ...snap.data() } as User };
        } catch {
            return { success: false };
        }
    },

    /**
     * Cria usuário no Firebase Auth e salva dados no Firestore
     */
    create: async (data: Partial<User> & { password: string }): Promise<{ success: boolean; error?: string }> => {
        try {
            // Chama Route Handler para criar no Auth (client SDK não pode criar outros usuários)
            const response = await fetch('/api/users/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            const result = await response.json();
            return result;
        } catch {
            return { success: false, error: 'Erro ao criar usuário.' };
        }
    },

    /**
     * Atualiza dados do usuário no Firestore
     */
    update: async (id: string, data: Partial<User>): Promise<{ success: boolean; error?: string }> => {
        try {
            await updateDoc(doc(db, COLLECTION, id), {
                ...data,
                updatedAt: new Date().toISOString(),
            });
            return { success: true };
        } catch {
            return { success: false, error: 'Erro ao atualizar usuário.' };
        }
    },

    /**
     * Desativa usuário (soft delete — nunca remove do Firebase Auth)
     */
    delete: async (id: string): Promise<{ success: boolean }> => {
        try {
            await updateDoc(doc(db, COLLECTION, id), {
                status: 'inactive' as UserStatus,
                updatedAt: new Date().toISOString(),
            });
            return { success: true };
        } catch {
            return { success: false };
        }
    },

    /**
     * Ativa ou desativa conta
     */
    toggleStatus: async (id: string, status: UserStatus): Promise<{ success: boolean }> => {
        try {
            await updateDoc(doc(db, COLLECTION, id), {
                status,
                updatedAt: new Date().toISOString(),
            });
            return { success: true };
        } catch {
            return { success: false };
        }
    }
};

export default UserServices;