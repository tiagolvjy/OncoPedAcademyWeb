"use client";
import { useRouter } from "next/navigation";
import AppMenuItem from "./menu-item";
import UserServices from "@/services/user";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function AppMenu() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [mounted, setMounted] = useState(false);
    // ==============================================================================
    const handleLogout = async () => {
        await UserServices.logout();
        router.replace('/');
    }
    // --------------------------
    useEffect(() => {
        setUser(UserServices.getCurrentUser());
        setMounted(true);
    }, []);
    // ==============================================================================
    if (!mounted) return null;

    return (
        <div className="w-[70px] md:w-[260px] bg-(--background-primary) flex flex-col h-screen sticky top-0 flex-shrink-0 border-r border-[#e5e7eb]">

            {/* LOGO */}
                <div className="flex items-center justify-center py-5 border-b border-[#e5e7eb] bg-white">
                    <Image
                        src="/assets/img/logoOncoPedAcademy.png"
                        alt="OncoPed Academy"
                        width={160}
                        height={60}
                        className="hidden md:block object-contain mx-auto"
                        style={{ background: 'transparent' }}
                    />
                    <Image
                        src="/assets/img/logoOncoPedAcademy.png"
                        alt="OncoPed Academy"
                        width={44}
                        height={44}
                        className="block md:hidden object-contain mx-auto"
                        style={{ background: 'transparent' }}
                    />
                </div>

            {/* USUÁRIO */}
            <div className="hidden md:flex flex-col items-center px-4 py-4 border-b border-[#e5e7eb]">
                <div className="w-[48px] h-[48px] rounded-full bg-[#e5e7eb] flex items-center justify-center mb-2">
                    <i className="ion-person text-[22px] text-[#9ca3af]" />
                </div>
                <p className="text-[13px] font-semibold text-center">{user?.name}</p>
                <p className="text-[11px] text-[#6b7280] text-center capitalize">{user?.role === 'admin' ? 'Administrador' : user?.role === 'doctor' ? 'Médico' : 'Aluno'}</p>
                <Link href={`/admin/usuarios/editar/${user?.uid}`}>
                    <p className="text-[11px] text-[#2563eb] mt-1 hover:underline">Editar perfil</p>
                </Link>
            </div>

            {/* OPÇÕES */}
            <div className="flex-1 overflow-y-auto py-4 px-2">
                <AppMenuItem title="Dashboard"     icon="grid"            url="/admin/dashboard"/>
                {user?.role === 'admin' && (
                    <AppMenuItem title="Usuários"  icon="ios-people"      url="/admin/usuarios"/>
                )}
                <AppMenuItem title="Cursos"        icon="ios-book"        url="/admin/cursos"/>
                <AppMenuItem title="Certificados"  icon="ribbon-a"        url="/admin/certificados"/>
                <AppMenuItem title="Questionários" icon="ios-list"        url="/admin/questionarios"/>
            </div>

            {/* LOGOUT */}
            <div className="border-t border-[#e5e7eb] px-2 py-4">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center md:justify-start gap-2 px-3 py-2 rounded-lg text-[red] hover:bg-red-50 transition-colors cursor-pointer"
                >
                    <i className="ion-log-out text-[18px]"/>
                    <span className="hidden md:block text-[14px] font-semibold">Sair</span>
                </button>
            </div>
        </div>
    )
}