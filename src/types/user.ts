export type UserRole = 'admin' | 'doctor' | 'student';
export type UserStatus = 'active' | 'inactive';

export interface User {
    id: string;                  // UID do Firebase Auth
    name: string;
    email: string;
    role: UserRole;
    status: UserStatus;
    photoURL?: string | null;
    cpf?: string;
    phone?: string;
    birthDate?: string;
    gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
    observations?: string;
    createdAt: string;
    updatedAt: string;

    // Apenas médicos
    crm?: string;
    crmVerified?: boolean;
    specialty?: string;
}

// Usado nos cookies (sessão leve)
export interface UserSession {
    uid: string;
    name: string;
    email: string;
    role: UserRole;
}