"use client";
import { useEffect, useState } from "react";
import CertificateServices from "@/services/certificates";
import UserServices from "@/services/user";
import { AppButton, AppInput, AppLoader, AppModal } from "@/themes/components";
import { getFlashData } from "@/helpers/router";
import { Certificate } from "@/types/certificate";

export default function CertificateList() {

    const [certificates, setCertificates] = useState<Certificate[]>([]);
    const [certRemove, setCertRemove] = useState<Certificate | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState<any>(null);
    const [filter, setFilter] = useState({
        userName: '',
        courseTitle: '',
    });

    const session = UserServices.getCurrentUser();

    // ======================================================================
    const getCertificates = async (p: number) => {
        if (!session) return;
        setLoading(true);
        const { success, certificates, pagination } = await CertificateServices.getAll(session, p, filter);
        if (success && certificates) {
            setCertificates(certificates);
            setPagination(pagination);
        }
        setLoading(false);
    }
    // -----------
    const handleRemove = (cert: Certificate) => {
        setCertRemove(cert);
        setSuccess(null);
        setError(null);
    }
    // -----------
    const handleModalConfirm = async () => {
        if (!certRemove) return;
        setLoading(true);
        setCertRemove(null);
        const { success, error } = await CertificateServices.delete(certRemove.id);
        if (success) setSuccess('Certificado removido com sucesso!');
        else setError(error ?? 'Erro ao remover certificado.');
        getCertificates(1);
    }
    // -----------
    const handlePage = (newPage: number) => {
        setPage(newPage);
        getCertificates(newPage);
    }
    // -----------
    useEffect(() => {
        getCertificates(page);
        (() => {
            const data = getFlashData();
            if (data?.success) setSuccess(data.success);
            if (data?.error) setError(data.error);
        })();
    }, []);
    // ======================================================================
    return (
        <>
            {/* FILTROS */}
            <h3 className="text-[18px] font-bold mt-4">Filtros</h3>
            <div className="flex flex-col border-b-[2px] border-[#dedede] p-2">
                <div className="flex gap-2 flex-wrap">
                    <AppInput
                        type="text"
                        label="Aluno"
                        value={filter.userName}
                        onChange={(e) => setFilter({ ...filter, userName: e.target.value })}
                    />
                    <AppInput
                        type="text"
                        label="Curso"
                        value={filter.courseTitle}
                        onChange={(e) => setFilter({ ...filter, courseTitle: e.target.value })}
                    />
                </div>
                <AppButton title="Filtrar" className="w-[100px]" type="outline" onClick={() => getCertificates(page)} />
            </div>

            {success && <p className="bg-[#7fc545] px-5 text-center rounded-full p-1 mt-2">{success}</p>}
            {error   && <p className="bg-[tomato]  px-5 text-center rounded-full p-1 mt-2">{error}</p>}

            {loading && <div className="flex justify-center mt-5"><AppLoader size={50} /></div>}

            {!loading && (
                <div className="overflow-x-auto mt-3">
                    <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-sm">
                        <thead>
                            <tr className="bg-[#1a1f36] text-white">
                                <th className="py-3 px-4 text-left text-sm font-semibold">Aluno</th>
                                <th className="py-3 px-4 text-left text-sm font-semibold">Email</th>
                                <th className="py-3 px-4 text-left text-sm font-semibold">Curso</th>
                                <th className="py-3 px-4 text-left text-sm font-semibold">Data de emissão</th>
                                <th className="py-3 px-4 text-left text-sm font-semibold">Código</th>
                                {session?.role === 'admin' && (
                                    <th className="py-3 px-4 text-left text-sm font-semibold">Ações</th>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {certificates.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="py-4 text-center text-sm text-gray-400">
                                        Nenhum certificado encontrado.
                                    </td>
                                </tr>
                            )}
                            {certificates.map(cert => (
                                <tr key={cert.id} className="hover:bg-[#f9fafb] transition-colors border-b border-gray-100">
                                    <td className="py-3 px-4 text-sm">{cert.userName}</td>
                                    <td className="py-3 px-4 text-sm">{cert.userEmail}</td>
                                    <td className="py-3 px-4 text-sm">{cert.courseTitle}</td>
                                    <td className="py-3 px-4 text-sm">
                                        {new Date(cert.issuedAt).toLocaleDateString('pt-BR')}
                                    </td>
                                    <td className="py-3 px-4 text-sm font-mono text-xs">{cert.validationCode}</td>
                                    {session?.role === 'admin' && (
                                        <td className="py-3 px-4 text-sm">
                                            <i
                                                className="ion-ios-trash text-[20px] text-[#ed1b2d] mx-[10px] cursor-pointer"
                                                onClick={() => handleRemove(cert)}
                                            />
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {pagination && (
                        <div className="flex justify-end mt-[20px]">
                            {!pagination.firstPage && (
                                <AppButton title="Anterior" className="mr-[10px]" icon="arrow-left-a" form="round" onClick={() => handlePage(page - 1)} />
                            )}
                            {!pagination.lastPage && (
                                <AppButton title="Próximo" className="ml-[10px]" icon="arrow-right-a" form="round" onClick={() => handlePage(page + 1)} />
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* MODAL — confirmar remoção */}
            {certRemove && (
                <AppModal title="Remover certificado">
                    <p>Deseja realmente remover o certificado de <strong>{certRemove.userName}</strong> para o curso <strong>{certRemove.courseTitle}</strong>?</p>
                    <p className="text-sm text-gray-500 mt-1">Esta ação não pode ser desfeita.</p>
                    <div className="flex justify-between p-[20px]">
                        <AppButton title="Sim, remover" icon="checkmark" form="round" color="#ed1b2d" onClick={handleModalConfirm} />
                        <AppButton title="Cancelar" icon="close" color="tomato" form="round" onClick={() => setCertRemove(null)} />
                    </div>
                </AppModal>
            )}
        </>
    );
}