"use client";
import { AppButton, AppInput, AppSelect } from "@/themes/components";
import PhotoUpload from "@/themes/components/photo-upload";
import { Formik } from "formik";
import * as Yup from 'yup';
import UserServices from "@/services/user";
import { useRouter } from "next/navigation";
import { setFlashData } from "@/helpers/router";
import { useState } from "react";
import { UserRole } from "@/types/user";

const formatCPF = (value: string) => {
    return value
        .replace(/\D/g, '')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})/, '$1-$2')
        .slice(0, 14);
}

const formatPhone = (value: string) => {
    return value
        .replace(/\D/g, '')
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2')
        .slice(0, 15);
}

const formatDate = (value: string) => {
    return value
        .replace(/\D/g, '')
        .replace(/(\d{2})(\d)/, '$1/$2')
        .replace(/(\d{2})(\d)/, '$1/$2')
        .slice(0, 10);
}

const GENDER_OPTIONS = [
    { value: 'male', label: 'Masculino' },
    { value: 'female', label: 'Feminino' },
    { value: 'other', label: 'Outro' },
    { value: 'prefer_not_to_say', label: 'Prefiro não informar' },
];

export default function UsuarioForm() {

    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [photoURL, setPhotoURL] = useState<string | null>(null);
    // ===========================================================================
    const handleOnSubmit = async (data: any) => {
        setError(null);
        const { success, error } = await UserServices.create({
            ...data,
            photoURL: photoURL ?? null,
        });
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
                cpf: '',
                crm: '',
                phone: '',
                birthDate: '',
                gender: '',
                observations: '',
            }}
            validationSchema={Yup.object({
                name: Yup.string().required('Campo obrigatório'),
                email: Yup.string().required('Campo obrigatório').email('Campo precisa ser um email'),
                password: Yup.string().required('Campo obrigatório').min(6, 'Mínimo 6 caracteres'),
                cpf: Yup.string().required('Campo obrigatório'),
                birthDate: Yup.string().required('Campo obrigatório'),
                gender: Yup.string().required('Campo obrigatório'),
                crm: Yup.string().when('role', {
                    is: 'doctor',
                    then: (s) => s.required('CRM obrigatório para médicos'),
                }),
            })}
            onSubmit={handleOnSubmit}
        >
            {({ handleChange, handleSubmit, isSubmitting, isValid, errors, values, setFieldValue }) => (
                <form>
                    {/* FOTO */}
                    <p className="ff-default ml-3 mb-1">Foto de perfil:</p>
                    <PhotoUpload onUpload={(url) => setPhotoURL(url)} />

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
                    <AppInput
                        placeholder="XXX.XXX.XXX-XX"
                        label="CPF:"
                        name="cpf"
                        onChange={(e) => {
                            const masked = formatCPF(e.target.value);
                            setFieldValue('cpf', masked);
                        }}
                        icon="card"
                        error={errors.cpf}
                        value={values.cpf}
                    />
                    <AppInput
                        placeholder="DD/MM/AAAA"
                        label="Data de nascimento:"
                        name="birthDate"
                        onChange={(e) => {
                            const masked = formatDate(e.target.value);
                            setFieldValue('birthDate', masked);
                        }}
                        icon="calendar"
                        error={errors.birthDate}
                        value={values.birthDate}
                    />
                    <AppSelect
                        label="Sexo:"
                        onChange={handleChange}
                        name="gender"
                        value={values.gender}
                    >
                        <option value="">Selecione</option>
                        {GENDER_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </AppSelect>
                    {errors.gender && <p className="text-[tomato] ff-default text-[12px] text-right mt-[-10px]">{errors.gender}</p>}

                    <AppSelect label="Perfil:" onChange={handleChange} name="role" value={values.role}>
                        <option value="student">Aluno</option>
                        <option value="doctor">Médico</option>
                        <option value="admin">Administrador</option>
                    </AppSelect>

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
                        placeholder="(XX) XXXXX-XXXX"
                        label="Telefone:"
                        name="phone"
                        onChange={(e) => {
                            const masked = formatPhone(e.target.value);
                            setFieldValue('phone', masked);
                        }}
                        icon="ios-telephone"
                        value={values.phone}
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