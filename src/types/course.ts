export type CourseStatus = 'draft' | 'published';

export interface Lesson {
    id: string;
    title: string;
    videoURL?: string;
    duration: number;        // em minutos
    order: number;
    createdAt: string;
    updatedAt: string;
}

export interface Module {
    id: string;
    title: string;
    order: number;
    createdAt: string;
    updatedAt: string;
}

export interface Course {
    id: string;
    title: string;
    description: string;
    coverImage?: string;
    authorId: string;
    authorName: string;
    status: CourseStatus;
    verified: boolean;
    verifiedBy?: string;
    verifiedAt?: string;
    duration: number;        // em horas
    hasCertificate: boolean;
    embeddingIndexed: boolean;
    createdAt: string;
    updatedAt: string;
}