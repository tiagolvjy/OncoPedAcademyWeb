import { Metadata } from "next";
import Image from "next/image";
import LoginForm from "./_form";

export const metadata: Metadata = {
  title: 'Login',
};

export default function Page() {
    return (
        <div className="flex h-screen">
            {/* ESQUERDA */}
            <div className="flex-1 justify-center items-center bg-[#f0f4f8] hidden lg:flex flex-col gap-6 px-12">
                <Image
                    src="/assets/img/logoOncoPedAcademy.png"
                    alt="OncoPed Academy"
                    width={260}
                    height={110}
                    className="object-contain"
                />
                <div className="text-center max-w-[380px]">
                    <h1 className="text-[#0A1628] text-[24px] font-bold mb-3">OncoPed Academy</h1>
                    <p className="text-gray-500 text-[15px] leading-relaxed">
                        Plataforma de capacitação em oncologia pediátrica para estudantes e profissionais da saúde.
                    </p>
                </div>
            </div>

            {/* DIREITA */}
            <div className="flex flex-1 justify-center items-center bg-white flex-col border-l border-[#e5e7eb]">
                <div className="flex lg:hidden mb-8">
                    <Image
                        src="/assets/img/logoOncoPedAcademy.png"
                        alt="OncoPed Academy"
                        width={180}
                        height={70}
                        className="object-contain"
                    />
                </div>
                <LoginForm />
            </div>
        </div>
    )
}