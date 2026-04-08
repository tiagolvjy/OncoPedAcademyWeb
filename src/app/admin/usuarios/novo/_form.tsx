"use client";
import { AppButton, AppInput, AppSelect } from "@/themes/components";
import { Formik } from "formik";
import * as Yup from 'yup';
import UserServices from "@/services/user";
import { useRouter } from "next/navigation";
import { setFlashData } from "@/helpers/router";
import { useState } from "react";
import { UserRole } from "@/types/user";

export default function UsuarioForm() {

    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    // ===========================================================================
    const handleOnSubmit = async (data: any) => {
        setError(null);
        const { success, error } = await UserServices.create(data);
        if (success) {
            setFlashData({ success: 'Usuário cadastrado com sucesso' });
            router.replace('/admin/usuarios');
        } else if (error) {
            setError(error);
        }
    }
    // ===========================================================================
    return (
        <Formik
            initialValues={{
                name: '',
                email: '',
                password: '',
                role: 'student' as UserRole,
                crm: '',
                phone: '',
                observations: '',
            }}
            validationSchema={Yup.object({
                name: Yup.string().required('Campo obrigatório'),
                email: Yup.string().required('Campo obrigatório').email('Campo precisa ser um email'),
                password: Yup.string().required('Campo obrigatório').min(6, 'Mínimo 6 caracteres'),
                crm: Yup.string().when('role', {
                    is: 'doctor',
                    then: (s) => s.required('CRM obrigatório para médicos'),
                }),
            })}
            onSubmit={handleOnSubmit}
        >
            {({ handleChange, handleSubmit, isSubmitting, isValid, errors, values }) => (
                <form>
                    <AppInput
                        placeholder="Digite o nome"
                        label="Nome:"
                        name="name"
                        onChange={handleChange}
                        icon="person"
                        error={errors.name}
                    />
                    <AppInput
                        placeholder="Digite o email"
                        label="Email:"
                        name="email"
                        onChange={handleChange}
                        icon="email"
                        error={errors.email}
                    />
                    <AppInput
                        placeholder="Digite a senha"
                        label="Senha:"
                        name="password"
                        type="password"
                        onChange={handleChange}
                        icon="locked"
                        openPassword
                        error={errors.password}
                    />
                    <AppSelect label="Perfil:" onChange={handleChange} name="role" value={values.role}>
                        <option value="student">Aluno</option>
                        <option value="doctor">Médico</option>
                        <option value="admin">Administrador</option>
                    </AppSelect>

                    {/* CRM — visível apenas para médicos */}
                    {values.role === 'doctor' && (
                        <AppInput
                            placeholder="Digite o CRM"
                            label="CRM:"
                            name="crm"
                            onChange={handleChange}
                            icon="card"
                            error={errors.crm}
                        />
                    )}

                    <AppInput
                        placeholder="Digite o telefone"
                        label="Telefone:"
                        name="phone"
                        onChange={handleChange}
                        icon="ios-telephone"
                    />
                    <AppInput
                        placeholder="Observações"
                        label="Observações:"
                        name="observations"
                        onChange={handleChange}
                        icon="ios-paper"
                    />

                    {error && <p className="my-3 text-[tomato] text-[15px]">{error}</p>}
                    <AppButton
                        title="Salvar"
                        icon="checkmark"
                        onClick={() => handleSubmit()}
                        disabled={!isValid || isSubmitting}
                    />
                </form>
            )}
        </Formik>
    )
}