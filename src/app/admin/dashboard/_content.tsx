"use client";
import { useEffect, useState } from "react";
import DashboardServices, { DashboardMetrics, CourseApprovalData, LevelDistribution } from "@/services/dashboard";
import { AppLoader } from "@/themes/components";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    Legend, ResponsiveContainer, PieChart, Pie, Cell, PieLabelRenderProps,
} from "recharts";


function MetricCard({ title, value, icon, color }: {
    title: string; value: number; icon: string; color: string;
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
                    Aproveitamento: {payload[1].value - payload[0].value >= 0 ? '+' : ''}{payload[1].value - payload[0].value}%
                </p>
            )}
        </div>
    );
}

const RADIAN = Math.PI / 180;
function CustomPieLabel({ cx, cy, midAngle, innerRadius, outerRadius, value, name }: any) {
    if (value === 0) return null;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
        <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight="bold">
            {value}
        </text>
    );
}


export default function DashboardContent() {

    const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
    const [approvalData, setApprovalData] = useState<CourseApprovalData[]>([]);
    const [levelData, setLevelData] = useState<LevelDistribution[]>([]);
    const [selectedCourse, setSelectedCourse] = useState<string>('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            const [metricsResult, approvalResult, levelResult] = await Promise.all([
                DashboardServices.getMetrics(),
                DashboardServices.getApprovalData(),
                DashboardServices.getLevelDistribution(),
            ]);

            if (metricsResult.success && metricsResult.metrics)
                setMetrics(metricsResult.metrics);
            else
                setError('Erro ao carregar métricas.');

            if (approvalResult.success && approvalResult.data)
                setApprovalData(approvalResult.data);

            if (levelResult.success && levelResult.data)
                setLevelData(levelResult.data);

            setLoading(false);
        })();
    }, []);

    const filteredData = selectedCourse === 'all'
        ? approvalData
        : approvalData.filter(d => d.courseTitle === selectedCourse);

    const chartData = filteredData.map(d => ({
        name: d.courseTitle.length > 25 ? d.courseTitle.substring(0, 25) + '...' : d.courseTitle,
        'Pré-conteúdo': d.preScore,
        'Pós-conteúdo': d.postScore,
    }));

    const totalLeveled = levelData.reduce((acc, d) => acc + d.count, 0);

    if (loading) return <div className="flex justify-center mt-10"><AppLoader size={50} /></div>;

    return (
        <div className="flex flex-col gap-6">

            {error && <p className="bg-[tomato] px-5 text-center rounded-full p-1">{error}</p>}

            {/* CARDS */}
            {metrics && (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
                    <MetricCard title="Alunos ativos"        value={metrics.totalStudents}      icon="ion-ios-people"  color="#4703D0" />
                    <MetricCard title="Médicos ativos"       value={metrics.totalDoctors}       icon="ion-ios-medkit"  color="#1aab67" />
                    <MetricCard title="Cursos publicados"    value={metrics.totalCourses}       icon="ion-ios-book"    color="#f59e0b" />
                    <MetricCard title="Certificados emitidos" value={metrics.totalCertificates} icon="ion-ribbon-a"    color="#ed1b2d" />
                    <MetricCard title="Questionários ativos" value={metrics.totalQuestionnaires} icon="ion-ios-list"   color="#0ea5e9" />
                </div>
            )}

            {/* LINHA 2 — Aproveitamento + Níveis lado a lado */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                {/* GRÁFICO DE APROVEITAMENTO — ocupa 2/3 */}
                <div className="bg-white rounded-lg p-6 shadow-sm xl:col-span-2">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                        <div>
                            <h3 className="text-[18px] font-bold">Aproveitamento por curso</h3>
                            <p className="text-sm text-gray-500">Comparativo pré vs pós-conteúdo por curso.</p>
                        </div>
                        {approvalData.length > 0 && (
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <label className="text-sm text-gray-500 whitespace-nowrap">Curso:</label>
                                <select
                                    value={selectedCourse}
                                    onChange={(e) => setSelectedCourse(e.target.value)}
                                    className="border border-[#dedede] rounded-lg px-3 py-2 text-sm bg-[#f5f5f5] outline-none cursor-pointer"
                                >
                                    <option value="all">Todos</option>
                                    {approvalData.map((d, i) => (
                                        <option key={i} value={d.courseTitle}>{d.courseTitle}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    {approvalData.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                            <i className="ion-ios-analytics text-[60px] mb-3" />
                            <p className="text-sm text-center">Nenhum dado disponível ainda.</p>
                            <p className="text-xs mt-1 text-center">Os dados aparecerão quando os alunos responderem os questionários pelo app.</p>
                        </div>
                    ) : filteredData.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                            <i className="ion-ios-analytics text-[50px] mb-2" />
                            <p className="text-sm">Nenhum dado para o curso selecionado.</p>
                        </div>
                    ) : (
                        <>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 60 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} angle={-30} textAnchor="end" interval={0} />
                                    <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend verticalAlign="top" wrapperStyle={{ paddingBottom: 16 }} />
                                    <Bar dataKey="Pré-conteúdo"  fill="#94a3b8" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="Pós-conteúdo"  fill="#4703D0" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>

                            <div className="mt-4 overflow-x-auto">
                                <table className="min-w-full rounded-lg overflow-hidden shadow-sm">
                                    <thead>
                                        <tr className="bg-[#1a1f36] text-white">
                                            <th className="py-3 px-4 text-left text-sm font-semibold">Curso</th>
                                            <th className="py-3 px-4 text-left text-sm font-semibold">Pré</th>
                                            <th className="py-3 px-4 text-left text-sm font-semibold">Pós</th>
                                            <th className="py-3 px-4 text-left text-sm font-semibold">Aproveitamento</th>
                                            <th className="py-3 px-4 text-left text-sm font-semibold">Alunos</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredData.map((d, i) => (
                                            <tr key={i} className="hover:bg-[#f9fafb] transition-colors border-b border-gray-100">
                                                <td className="py-3 px-4 text-sm">{d.courseTitle}</td>
                                                <td className="py-3 px-4 text-sm">{d.preScore}%</td>
                                                <td className="py-3 px-4 text-sm">{d.postScore}%</td>
                                                <td className="py-3 px-4 text-sm">
                                                    <span className={`font-bold ${d.improvement >= 0 ? 'text-[#1aab67]' : 'text-[#ed1b2d]'}`}>
                                                        {d.improvement >= 0 ? '+' : ''}{d.improvement}%
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-sm">{d.totalStudents}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>

                {/* DISTRIBUIÇÃO DE NÍVEIS — ocupa 1/3 */}
                <div className="bg-white rounded-lg p-6 shadow-sm">
                    <h3 className="text-[18px] font-bold mb-1">Níveis dos alunos</h3>
                    <p className="text-sm text-gray-500 mb-4">
                        Distribuição baseada no questionário de nivelamento geral.
                    </p>

                    {totalLeveled === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                            <i className="ion-ios-people text-[60px] mb-3" />
                            <p className="text-sm text-center">Nenhum aluno realizou o nivelamento ainda.</p>
                        </div>
                    ) : (
                        <>
                            <ResponsiveContainer width="100%" height={220}>
                                <PieChart>
                                    <Pie
                                        data={levelData.filter(d => d.count > 0)}
                                        dataKey="count"
                                        nameKey="level"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={90}
                                        labelLine={false}
                                        label={CustomPieLabel}
                                    >
                                        {levelData.filter(d => d.count > 0).map((entry, i) => (
                                            <Cell key={i} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value: any, name: any) => [`${value} aluno(s)`, name]} />
                                </PieChart>
                            </ResponsiveContainer>

                            {/* LEGENDA */}
                            <div className="flex flex-col gap-2 mt-4">
                                {levelData.map((d, i) => (
                                    <div key={i} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                                            <span className="text-sm text-gray-600">{d.level}</span>
                                        </div>
                                        <span className="text-sm font-semibold text-gray-700">
                                            {d.count} <span className="text-gray-400 font-normal">({totalLeveled > 0 ? Math.round((d.count / totalLeveled) * 100) : 0}%)</span>
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}