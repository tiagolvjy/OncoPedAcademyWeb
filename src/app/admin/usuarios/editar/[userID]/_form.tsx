"use client";
import { AppButton, AppInput, AppSelect } from "@/themes/components";
import PhotoUpload from "@/themes/components/photo-upload";
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
// ===========================================================================
export default function UsuarioForm({ userID }: UsuarioFormProps) {

    const router = useRouter();
    const [user, setUser] = useState({
        name: '',
        email: '',
        role: 'student' as UserRole,
        cpf: '',
        crm: '',
        phone: '',
        birthDate: '',
        gender: '',
        observations: '',
    });
    const [photoURL, setPhotoURL] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    // ===========================================================================
    const handleOnSubmit = async (data: any) => {
        setError(null);
        const { success, error } = await UserServices.update(userID, {
            name: data.name,
            role: data.role,
            cpf: data.cpf || null,
            crm: data.crm || null,
            phone: data.phone || null,
            birthDate: data.birthDate || null,
            gender: data.gender || null,
            observations: data.observations || null,
            photoURL: photoURL || null,
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
                    cpf: user.cpf ?? '',
                    crm: user.crm ?? '',
                    phone: user.phone ?? '',
                    birthDate: user.birthDate ?? '',
                    gender: user.gender ?? '',
                    observations: user.observations ?? '',
                });
                setPhotoURL(user.photoURL ?? null);
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
                    <PhotoUpload
                        currentURL={photoURL}
                        onUpload={(url) => setPhotoURL(url)}
                    />

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
                        disabled
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
                        <option value="admin">Administrador</option>
                        <option value="doctor">Médico</option>
                        <option value="student">Aluno</option>
                    </AppSelect>

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