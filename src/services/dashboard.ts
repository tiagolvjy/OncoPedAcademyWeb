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

export interface LevelDistribution {
    level: string;
    count: number;
    color: string;
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

    getLevelDistribution: async (): Promise<{ success: boolean; data?: LevelDistribution[] }> => {
    try {
        const snapshot = await getDocs(
            query(
                collection(db, 'questionnaire_results'),
                where('type', '==', 'leveling')
            )
        );

        if (snapshot.empty) return { success: true, data: [] };

        // Pega o resultado mais recente por aluno
        const byUser: Record<string, number> = {};
        snapshot.docs.forEach(d => {
            const data = d.data();
            if (!data.userId || data.score === undefined) return;
            // Mantém o mais recente (maior score ou último)
            if (!(data.userId in byUser) || data.completedAt > (byUser[data.userId + '_date'] ?? ''))
                byUser[data.userId] = data.score;
        });

        // Classifica por nível
        const levels: Record<string, number> = {
            'Muito Iniciante': 0,
            'Iniciante': 0,
            'Intermediário': 0,
            'Avançado': 0,
            'Especialista': 0,
        };

        Object.values(byUser).forEach(score => {
            if (score <= 19)       levels['Muito Iniciante']++;
            else if (score <= 39)  levels['Iniciante']++;
            else if (score <= 59)  levels['Intermediário']++;
            else if (score <= 79)  levels['Avançado']++;
            else                   levels['Especialista']++;
        });

        const colors: Record<string, string> = {
            'Muito Iniciante': '#94a3b8',
            'Iniciante':       '#60a5fa',
            'Intermediário':   '#34d399',
            'Avançado':        '#f59e0b',
            'Especialista':    '#4703D0',
        };

        const data: LevelDistribution[] = Object.entries(levels).map(([level, count]) => ({
            level,
            count,
            color: colors[level],
        }));

        return { success: true, data };
    } catch (error) {
        console.error(error);
        return { success: false };
    }
},
};

export default DashboardServices;