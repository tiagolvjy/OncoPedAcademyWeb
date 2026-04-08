"use client";
import { AppButton, AppInput, AppSelect } from "@/themes/components";
import { Formik } from "formik";
import * as Yup from 'yup';
import UserServices from "@/services/user";
import { useRouter } from "next/navigation";
import { setFlashData } from "@/helpers/router";
import { useEffect, useState } from "react";
import { UserRole } from "@/types/user";

export interface UsuarioFormProps {
    userID: string
}
// ===========================================================================
export default function UsuarioForm({ userID }: UsuarioFormProps) {

    const router = useRouter();
    const [user, setUser] = useState({
        name: '',
        email: '',
        role: 'student' as UserRole,
        crm: '',
        phone: '',
        observations: '',
    });
    const [error, setError] = useState<string | null>(null);
    // ===========================================================================
    const handleOnSubmit = async (data: any) => {
        setError(null);
        const { success, error } = await UserServices.update(userID, {
            name: data.name,
            role: data.role,
            crm: data.crm || null,
            phone: data.phone || null,
            observations: data.observations || null,
        });
        if (success) {
            setFlashData({ success: 'Usuário editado com sucesso' });
            router.replace('/admin/usuarios');
        } else if (error) {
            setError(error);
        }
    }
    // -----------------------
    useEffect(() => {
        (async () => {
            const { success, user } = await UserServices.getById(userID);
            if (success && user) {
                setUser({
                    name: user.name ?? '',
                    email: user.email ?? '',
                    role: user.role ?? 'student',
                    crm: user.crm ?? '',
                    phone: user.phone ?? '',
                    observations: user.observations ?? '',
                });
            } else {
                setFlashData({ error: 'Usuário não encontrado' });
                router.replace('/admin/usuarios');
            }
        })();
    }, []);
    // ===========================================================================
    return (
        <Formik
            initialValues={user}
            enableReinitialize
            validationSchema={Yup.object({
                name: Yup.string().required('Campo obrigatório'),
                email: Yup.string().required('Campo obrigatório').email('Campo precisa ser um email'),
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
                        value={values.name}
                    />
                    <AppInput
                        placeholder="Email"
                        label="Email:"
                        name="email"
                        onChange={handleChange}
                        icon="email"
                        error={errors.email}
                        value={values.email}
                        disabled // email não pode ser alterado direto no Firestore
                    />
                    <AppSelect label="Perfil:" onChange={handleChange} name="role" value={values.role}>
                        <option value="admin">Administrador</option>
                        <option value="doctor">Médico</option>
                        <option value="student">Aluno</option>
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
                            value={values.crm}
                        />
                    )}

                    <AppInput
                        placeholder="Digite o telefone"
                        label="Telefone:"
                        name="phone"
                        onChange={handleChange}
                        icon="ios-telephone"
                        value={values.phone}
                    />
                    <AppInput
                        placeholder="Observações"
                        label="Observações:"
                        name="observations"
                        onChange={handleChange}
                        icon="ios-paper"
                        value={values.observations}
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