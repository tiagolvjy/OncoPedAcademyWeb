"use client";
import { useEffect, useState } from "react";
import UserServices from "@/services/user";
import Link from "next/link";
import { AppButton, AppInput, AppLoader, AppModal, AppSelect } from "@/themes/components";
import { getFlashData } from "@/helpers/router";
import { useSearchParams } from "next/navigation";
import { User, UserStatus } from "@/types/user";

const ROLE_LABEL: Record<string, string> = {
    admin:   'Administrador',
    doctor:  'Médico',
    student: 'Aluno',
};

const STATUS_LABEL: Record<string, string> = {
    active:   'Ativo',
    inactive: 'Inativo',
};

export default function UserList() {

    const params = useSearchParams();
    const session = UserServices.getCurrentUser();
    const [users, setUsers] = useState<User[]>([]);
    const [userRemove, setUserRemove] = useState<User | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(Number(params.get('page') ?? 1));
    const [pagination, setPagination] = useState<any>(null);
    const [filter, setFilter] = useState({
        name: '',
        email: '',
        role: '-1',
        status: '-1',
    });

    // ======================================================================
    // Protege admins e o próprio usuário logado
    const isProtected = (user: User) => {
        return user.role === 'admin' || user.id === session?.uid;
    }
    // ======================================================================
    const getUsers = async (p: number) => {
        setLoading(true);
        const { success, users, pagination } = await UserServices.getAll(p, filter);
        if (success && users) {
            setUsers(users);
            setPagination(pagination);
        }
        setLoading(false);
    }
    // -----------
    const handleRemove = (user: User) => {
        setUserRemove(user);
        setSuccess(null);
        setError(null);
    }
    // -----------
    const handleModalConfirm = async () => {
        if (!userRemove) return;
        setLoading(true);
        setUserRemove(null);
        const { success } = await UserServices.delete(userRemove.id);
        if (success) setSuccess('Usuário desativado com sucesso!');
        else setError('Erro ao desativar usuário.');
        getUsers(1);
    }
    // -----------
    const handleToggleStatus = async (user: User) => {
        const newStatus: UserStatus = user.status === 'active' ? 'inactive' : 'active';
        const { success } = await UserServices.toggleStatus(user.id, newStatus);
        if (success) {
            setSuccess(`Usuário ${newStatus === 'active' ? 'ativado' : 'desativado'} com sucesso!`);
            getUsers(page);
        } else {
            setError('Erro ao alterar status do usuário.');
        }
    }
    // -----------
    const handlePage = (newPage: number) => {
        setPage(newPage);
        getUsers(newPage);
    }
    // -----------
    useEffect(() => {
        getUsers(page);
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
            <h3 className="text-[18px] font-bold">Filtros</h3>
            <div className="flex flex-col border-b-[2px] border-[#dedede] p-2">
                <div className="flex gap-2 flex-wrap">
                    <AppInput
                        type="text"
                        label="Nome"
                        value={filter.name}
                        onChange={(e) => setFilter({ ...filter, name: e.target.value })}
                    />
                    <AppInput
                        type="email"
                        label="Email"
                        value={filter.email}
                        onChange={(e) => setFilter({ ...filter, email: e.target.value })}
                    />
                    <AppSelect
                        label="Perfil"
                        value={filter.role}
                        onChange={(e) => setFilter({ ...filter, role: e.target.value })}
                    >
                        <option value="-1">Todos</option>
                        <option value="admin">Administrador</option>
                        <option value="doctor">Médico</option>
                        <option value="student">Aluno</option>
                    </AppSelect>
                    <AppSelect
                        label="Status"
                        value={filter.status}
                        onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                    >
                        <option value="-1">Todos</option>
                        <option value="active">Ativo</option>
                        <option value="inactive">Inativo</option>
                    </AppSelect>
                </div>
                <AppButton title="Filtrar" className="w-[100px]" type="outline" onClick={() => getUsers(page)} />
            </div>

            {success && <p className="bg-[#7fc545] px-5 text-center rounded-full p-1 mt-2">{success}</p>}
            {error   && <p className="bg-[tomato]  px-5 text-center rounded-full p-1 mt-2">{error}</p>}

            {loading && <div className="flex justify-center mt-5"><AppLoader size={50} /></div>}

            {!loading && (
                <div className="overflow-x-auto mt-3">
                    <table className="min-w-full bg-white">
                        <thead>
                            <tr>
                                <th className="py-2 px-4 border-b border-gray-200 text-left text-sm font-semibold text-gray-600">Nome</th>
                                <th className="py-2 px-4 border-b border-gray-200 text-left text-sm font-semibold text-gray-600">Email</th>
                                <th className="py-2 px-4 border-b border-gray-200 text-left text-sm font-semibold text-gray-600">Perfil</th>
                                <th className="py-2 px-4 border-b border-gray-200 text-left text-sm font-semibold text-gray-600">Status</th>
                                <th className="py-2 px-4 border-b border-gray-200 text-left text-sm font-semibold text-gray-600">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="py-4 text-center text-sm text-gray-400">
                                        Nenhum usuário encontrado.
                                    </td>
                                </tr>
                            )}
                            {users.map(user => (
                                <tr key={user.id} className={user.status === 'inactive' ? 'opacity-50' : ''}>
                                    <td className="py-2 px-4 border-b border-gray-200 text-sm">{user.name}</td>
                                    <td className="py-2 px-4 border-b border-gray-200 text-sm">{user.email}</td>
                                    <td className="py-2 px-4 border-b border-gray-200 text-sm">{ROLE_LABEL[user.role] ?? user.role}</td>
                                    <td className="py-2 px-4 border-b border-gray-200 text-sm">{STATUS_LABEL[user.status] ?? user.status}</td>
                                    <td className="py-2 px-4 border-b border-gray-200 text-sm">
                                        {/* Editar */}
                                        <Link href={`/admin/usuarios/editar/${user.id}`}>
                                            <i className="ion-edit text-[20px] text-[#1aab67] mx-[10px] cursor-pointer" />
                                        </Link>

                                        {/* Ativar / Desativar */}
                                        {!isProtected(user) ? (
                                            <i
                                                className={`ion-power text-[20px] mx-[10px] cursor-pointer ${user.status === 'active' ? 'text-[orange]' : 'text-[#1aab67]'}`}
                                                title={user.status === 'active' ? 'Desativar' : 'Ativar'}
                                                onClick={() => handleToggleStatus(user)}
                                            />
                                        ) : (
                                            <i
                                                className="ion-power text-[20px] mx-[10px] text-gray-300 cursor-not-allowed"
                                                title="Ação não permitida"
                                            />
                                        )}

                                        {/* Remover */}
                                        {!isProtected(user) ? (
                                            <i
                                                className="ion-ios-trash text-[20px] text-[#ed1b2d] mx-[10px] cursor-pointer"
                                                title="Desativar usuário"
                                                onClick={() => handleRemove(user)}
                                            />
                                        ) : (
                                            <i
                                                className="ion-ios-trash text-[20px] mx-[10px] text-gray-300 cursor-not-allowed"
                                                title="Ação não permitida"
                                            />
                                        )}
                                    </td>
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

            {/* MODAL — confirmar desativação */}
            {userRemove && (
                <AppModal title="Desativar usuário">
                    <p>Deseja realmente desativar o usuário <strong>{userRemove.name}</strong> ({userRemove.email})?</p>
                    <p className="text-sm text-gray-500 mt-1">O usuário não será excluído, apenas desativado.</p>
                    <div className="flex justify-between p-[20px]">
                        <AppButton title="Sim" icon="checkmark" form="round" color="#7fc545" onClick={handleModalConfirm} />
                        <AppButton title="Cancelar" icon="close" color="tomato" form="round" onClick={() => setUserRemove(null)} />
                    </div>
                </AppModal>
            )}
        </>
    );
}