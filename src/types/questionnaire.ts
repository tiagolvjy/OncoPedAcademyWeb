export type QuestionnaireType = 'leveling' | 'pre_content' | 'post_content';
export type QuestionnaireStatus = 'active' | 'inactive';

export interface QuestionOption {
    id: string;
    text: string;
    isCorrect: boolean;
}

export interface Question {
    id: string;
    text: string;
    imageURL?: string;
    options: QuestionOption[];
    order: number;
}

export interface Questionnaire {
    id: string;
    authorId: string;
    title: string;
    type: QuestionnaireType;
    courseId?: string;
    courseTitle?: string;
    timeLimit?: number;      // em minutos
    passingScore?: number;   // % mínima (post_content)
    status: QuestionnaireStatus;
    createdAt: string;
    updatedAt: string;
}