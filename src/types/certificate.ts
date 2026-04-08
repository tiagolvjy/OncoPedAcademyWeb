export interface Certificate {
    id: string;
    userId: string;
    userName: string;
    userEmail: string;
    courseId: string;
    courseTitle: string;
    authorId: string;        // ← para médico filtrar pelos próprios cursos
    issuedAt: string;
    validationCode: string;  // ← código único de validação
}