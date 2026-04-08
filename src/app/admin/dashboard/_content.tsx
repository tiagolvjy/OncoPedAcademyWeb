"use client";
import { useEffect, useState } from "react";
import DashboardServices, { DashboardMetrics, CourseApprovalData } from "@/services/dashboard";
import { AppLoader } from "@/themes/components";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

// ======================================================================
// CARD DE MÉTRICA
// ======================================================================
function MetricCard({ title, value, icon, color }: {
    title: string;
    value: number;
    icon: string;
    color: string;
}) {
    return (
        <div className="bg-white rounded-lg p-5 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${color}20` }}>
                <i className={`${icon} text-[24px]`} style={{ color }} />
            </div>
            <div>
                <p className="text-sm text-gray-500">{title}</p>
                <p className="text-[28px] font-bold">{value}</p>
            </div>
        </div>
    );
}

// ======================================================================
// TOOLTIP CUSTOMIZADO DO GRÁFICO
// ======================================================================
function CustomTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-md text-sm">
            <p className="font-bold mb-2 text-gray-700">{label}</p>
            {payload.map((entry: any) => (
                <p key={entry.name} style={{ color: entry.color }}>
                    {entry.name}: {entry.value}%
                </p>
            ))}
            {payload.length === 2 && (
                <p className="mt-1 font-bold text-[#4703D0]">
                    Aproveitamento: +{payload[1].value - payload[0].value}%
                </p>
            )}
        </div>
    );
}

// ======================================================================
// COMPONENTE PRINCIPAL
// ======================================================================
export default function DashboardContent() {

    const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
    const [approvalData, setApprovalData] = useState<CourseApprovalData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            const [metricsResult, approvalResult] = await Promise.all([
                DashboardServices.getMetrics(),
                DashboardServices.getApprovalData(),
            ]);

            if (metricsResult.success && metricsResult.metrics)
                setMetrics(metricsResult.metrics);
            else
                setError('Erro ao carregar métricas.');

            if (approvalResult.success && approvalResult.data)
                setApprovalData(approvalResult.data);

            setLoading(false);
        })();
    }, []);

    if (loading) return <div className="flex justify-center mt-10"><AppLoader size={50} /></div>;

    return (
        <div className="flex flex-col gap-6">

            {error && <p className="bg-[tomato] px-5 text-center rounded-full p-1">{error}</p>}

            {/* CARDS DE MÉTRICAS */}
            {metrics && (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
                    <MetricCard
                        title="Alunos ativos"
                        value={metrics.totalStudents}
                        icon="ion-ios-people"
                        color="#4703D0"
                    />
                    <MetricCard
                        title="Médicos ativos"
                        value={metrics.totalDoctors}
                        icon="ion-ios-medkit"
                        color="#1aab67"
                    />
                    <MetricCard
                        title="Cursos publicados"
                        value={metrics.totalCourses}
                        icon="ion-ios-book"
                        color="#f59e0b"
                    />
                    <MetricCard
                        title="Certificados emitidos"
                        value={metrics.totalCertificates}
                        icon="ion-ribbon-a"
                        color="#ed1b2d"
                    />
                    <MetricCard
                        title="Questionários ativos"
                        value={metrics.totalQuestionnaires}
                        icon="ion-ios-list"
                        color="#0ea5e9"
                    />
                </div>
            )}

            {/* GRÁFICO DE APROVEITAMENTO */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-[18px] font-bold mb-1">Aproveitamento por curso</h3>
                <p className="text-sm text-gray-500 mb-6">
                    Comparativo entre a média de acertos no questionário pré-conteúdo e pós-conteúdo por curso.
                </p>

                {approvalData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                        <i className="ion-ios-analytics text-[60px] mb-3" />
                        <p className="text-center text-sm">
                            Nenhum dado de aproveitamento disponível ainda.
                        </p>
                        <p className="text-center text-xs mt-1">
                            Os dados aparecerão aqui quando os alunos começarem a responder os questionários pelo app.
                        </p>
                    </div>
                ) : (
                    <>
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart
                                data={approvalData.map(d => ({
                                    name: d.courseTitle.length > 20
                                        ? d.courseTitle.substring(0, 20) + '...'
                                        : d.courseTitle,
                                    'Pré-conteúdo': d.preScore,
                                    'Pós-conteúdo': d.postScore,
                                    fullTitle: d.courseTitle,
                                    totalStudents: d.totalStudents,
                                }))}
                                margin={{ top: 5, right: 30, left: 0, bottom: 60 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis
                                    dataKey="name"
                                    tick={{ fontSize: 12, fill: '#6b7280' }}
                                    angle={-30}
                                    textAnchor="end"
                                    interval={0}
                                />
                                <YAxis
                                    tick={{ fontSize: 12, fill: '#6b7280' }}
                                    domain={[0, 100]}
                                    tickFormatter={(v) => `${v}%`}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend
                                    verticalAlign="top"
                                    wrapperStyle={{ paddingBottom: 20 }}
                                />
                                <Bar
                                    dataKey="Pré-conteúdo"
                                    fill="#94a3b8"
                                    radius={[4, 4, 0, 0]}
                                />
                                <Bar
                                    dataKey="Pós-conteúdo"
                                    fill="#4703D0"
                                    radius={[4, 4, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>

                        {/* TABELA RESUMO */}
                        <div className="mt-6 overflow-x-auto">
                            <table className="min-w-full">
                                <thead>
                                    <tr>
                                        <th className="py-2 px-4 border-b border-gray-200 text-left text-sm font-semibold text-gray-600">Curso</th>
                                        <th className="py-2 px-4 border-b border-gray-200 text-left text-sm font-semibold text-gray-600">Pré</th>
                                        <th className="py-2 px-4 border-b border-gray-200 text-left text-sm font-semibold text-gray-600">Pós</th>
                                        <th className="py-2 px-4 border-b border-gray-200 text-left text-sm font-semibold text-gray-600">Aproveitamento</th>
                                        <th className="py-2 px-4 border-b border-gray-200 text-left text-sm font-semibold text-gray-600">Alunos</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {approvalData.map((d, i) => (
                                        <tr key={i}>
                                            <td className="py-2 px-4 border-b border-gray-200 text-sm">{d.courseTitle}</td>
                                            <td className="py-2 px-4 border-b border-gray-200 text-sm">{d.preScore}%</td>
                                            <td className="py-2 px-4 border-b border-gray-200 text-sm">{d.postScore}%</td>
                                            <td className="py-2 px-4 border-b border-gray-200 text-sm">
                                                <span className={`font-bold ${d.improvement >= 0 ? 'text-[#1aab67]' : 'text-[#ed1b2d]'}`}>
                                                    {d.improvement >= 0 ? '+' : ''}{d.improvement}%
                                                </span>
                                            </td>
                                            <td className="py-2 px-4 border-b border-gray-200 text-sm">{d.totalStudents}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}