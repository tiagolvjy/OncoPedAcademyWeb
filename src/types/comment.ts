export type CommentStatus = 'visible' | 'removed';

export interface Comment {
    id: string;
    userId: string;
    userName: string;
    isVerifiedDoctor: boolean;
    courseId: string;
    courseTitle: string;
    text: string;
    likes: number;
    status: CommentStatus;
    createdAt: string;
}