"use client";
import { AppButton, AppInput, AppModal } from "@/themes/components";
import { Formik } from "formik";
import Image from "next/image";
import { useState } from "react";
import * as Yup from 'yup';
import UserServices from "@/services/user";
import { useRouter } from "next/navigation";

export default function LoginForm() {
    const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
    const [email, setEmail] = useState('');
    const [errorLogin, setErrorLogin] = useState<string | null>(null);
    const [messageResetPassword, setMessageResetPassword] = useState<{ success: boolean, message: string } | null>(null);
    const router = useRouter();
    // ======================================================
    const onSubmitLogin = async ({ email, password }: any) => {
        setErrorLogin(null);
        const { success, message } = await UserServices.login(email, password);
        if (success)
            router.push('/admin/dashboard');
        else
            setErrorLogin(message ?? 'Login ou senha incorreta');
    }
    const onSubmitResetPassword = async () => {
        setErrorLogin(null);
        setEmail('');
        const { success } = await UserServices.resetPassword(email);
        if (success)
            setMessageResetPassword({ success: true, message: 'Olhe a sua caixa de email para resetar a senha' });
        else
            setMessageResetPassword({ success: false, message: 'Não foi possível resetar a senha' });
    }
    const closeModal = () => {
        setEmail('');
        setShowResetPasswordModal(false);
    }
    // ======================================================
    return (
        <>
            <Formik
                initialValues={{ email: '', password: '' }}
                validationSchema={Yup.object({
                    email: Yup.string().required('Campo obrigatório').email('Campo precisa ser um email'),
                    password: Yup.string().required('Campo obrigatório').min(6, 'Campo precisa ter pelo menos 6 caracteres')
                })}
                onSubmit={onSubmitLogin}
            >
                {({ handleChange, handleSubmit, isSubmitting, isValid, errors }) => (
                    <form onSubmit={handleSubmit}>
                        <div className="w-[340px] flex flex-col gap-1">

                            <h1 className="text-[28px] font-bold text-[#0A1628] text-center mb-1">Entrar</h1>
                            <p className="text-[14px] text-gray-400 text-center mb-4">Acesse o painel administrativo</p>

                            <AppInput
                                placeholder="Email"
                                name="email"
                                onChange={handleChange}
                                icon="ios-email"
                                error={errors.email}
                            />
                            <AppInput
                                placeholder="Senha"
                                name="password"
                                type="password"
                                onChange={handleChange}
                                icon="locked"
                                openPassword
                                error={errors.password}
                            />

                            <p
                                className="cursor-pointer text-[12px] text-[#2563EB] hover:underline mb-2"
                                onClick={() => setShowResetPasswordModal(true)}
                            >
                                Esqueci minha senha
                            </p>

                            {errorLogin && (
                                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2 mb-2">
                                    <p className="text-[tomato] text-[13px] text-center">{errorLogin}</p>
                                </div>
                            )}

                            <AppButton
                                title="Entrar"
                                onClick={handleSubmit}
                                disabled={isSubmitting || !isValid}
                                form="round"
                            />

                            <p className="text-[12px] text-gray-400 text-center mt-2">
                                Não tem conta? Entre em contato com um administrador
                            </p>
                        </div>
                    </form>
                )}
            </Formik>

            {/* MODAL - RESETAR SENHA */}
            {showResetPasswordModal && (
                <AppModal title="Esqueci a senha" onClose={closeModal}>
                    <div className="flex-col flex items-stretch">
                        <Image
                            className="self-center my-8"
                            src="/assets/img/icons/reset-password.png"
                            alt="ícone resetar senha"
                            width={100}
                            height={100}
                        />
                        <p className="text-center text-[14px] text-gray-600 mb-4">
                            Digite seu e-mail e clique em "Enviar" para receber um link de redefinição de senha.
                        </p>
                        <AppInput
                            placeholder="Digite seu email"
                            icon="android-mail"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        {messageResetPassword?.success === false && (
                            <p className="text-[tomato] text-[13px] text-center mt-2">{messageResetPassword.message}</p>
                        )}
                        {messageResetPassword?.success === true && (
                            <p className="text-[green] text-[13px] text-center mt-2">{messageResetPassword.message}</p>
                        )}
                        <div className="flex justify-between mt-4">
                            <button
                                className="border border-red-400 text-red-400 rounded-full w-[150px] py-2 cursor-pointer hover:bg-red-50 transition-colors text-[14px]"
                                onClick={closeModal}
                            >
                                Cancelar
                            </button>
                            <button
                                className="bg-[#2563EB] text-white rounded-full w-[150px] py-2 cursor-pointer hover:bg-[#1d4ed8] transition-colors text-[14px]"
                                onClick={onSubmitResetPassword}
                            >
                                Enviar
                            </button>
                        </div>
                    </div>
                </AppModal>
            )}
        </>
    )
}