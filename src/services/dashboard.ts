import {
    collection,
    getDocs,
    query,
    where,
    orderBy,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface DashboardMetrics {
    totalStudents: number;
    totalDoctors: number;
    totalCourses: number;
    totalCertificates: number;
    totalQuestionnaires: number;
}

export interface CourseApprovalData {
    courseTitle: string;
    preScore: number;
    postScore: number;
    improvement: number;
    totalStudents: number;
}

const DashboardServices = {

    /**
     * Retorna métricas gerais da plataforma
     */
    getMetrics: async (): Promise<{ success: boolean; metrics?: DashboardMetrics }> => {
        try {
            const [
                studentsSnap,
                doctorsSnap,
                coursesSnap,
                certificatesSnap,
                questionnairesSnap,
            ] = await Promise.all([
                getDocs(query(collection(db, 'users'), where('role', '==', 'student'), where('status', '==', 'active'))),
                getDocs(query(collection(db, 'users'), where('role', '==', 'doctor'), where('status', '==', 'active'))),
                getDocs(query(collection(db, 'courses'), where('status', '==', 'published'))),
                getDocs(collection(db, 'certificates')),
                getDocs(query(collection(db, 'questionnaires'), where('status', '==', 'active'))),
            ]);

            return {
                success: true,
                metrics: {
                    totalStudents:      studentsSnap.size,
                    totalDoctors:       doctorsSnap.size,
                    totalCourses:       coursesSnap.size,
                    totalCertificates:  certificatesSnap.size,
                    totalQuestionnaires: questionnairesSnap.size,
                }
            };
        } catch (error) {
            console.error(error);
            return { success: false };
        }
    },

    /**
     * Retorna dados de aproveitamento por curso
     * Compara média de pré-conteúdo vs pós-conteúdo
     */
    getApprovalData: async (): Promise<{ success: boolean; data?: CourseApprovalData[] }> => {
        try {
            const snapshot = await getDocs(
                query(collection(db, 'questionnaire_results'), orderBy('completedAt', 'desc'))
            );

            if (snapshot.empty) return { success: true, data: [] };

            const results = snapshot.docs.map(d => d.data());

            // Agrupa por curso
            const byCourse: Record<string, {
                courseTitle: string;
                preScores: number[];
                postScores: number[];
                students: Set<string>;
            }> = {};

            results.forEach(r => {
                if (!r.courseId || r.type === 'leveling') return;
                if (!byCourse[r.courseId]) {
                    byCourse[r.courseId] = {
                        courseTitle: r.courseTitle,
                        preScores: [],
                        postScores: [],
                        students: new Set(),
                    };
                }
                if (r.type === 'pre_content')  byCourse[r.courseId].preScores.push(r.score);
                if (r.type === 'post_content') byCourse[r.courseId].postScores.push(r.score);
                byCourse[r.courseId].students.add(r.userId);
            });

            // Calcula médias
            const data: CourseApprovalData[] = Object.values(byCourse)
                .filter(c => c.preScores.length > 0 && c.postScores.length > 0)
                .map(c => {
                    const preScore  = Math.round(c.preScores.reduce((a, b) => a + b, 0) / c.preScores.length);
                    const postScore = Math.round(c.postScores.reduce((a, b) => a + b, 0) / c.postScores.length);
                    return {
                        courseTitle:   c.courseTitle,
                        preScore,
                        postScore,
                        improvement:   postScore - preScore,
                        totalStudents: c.students.size,
                    };
                })
                .sort((a, b) => b.improvement - a.improvement);

            return { success: true, data };
        } catch (error) {
            console.error(error);
            return { success: false };
        }
    },
};

export default DashboardServices;