import { AppMainContainer } from "@/themes/components";
import QuestionnaireList from "./_list";
import { AppButton } from "@/themes/components";

export const metadata = {
    title: 'Questionários'
}

export default function QuestionariosPage() {
    return (
        <AppMainContainer title="Questionários">
            <div className="flex justify-between items-center">
                <h1 className="font-bold text-[20px]">Lista de questionários</h1>
                <AppButton title='Novo questionário' form="round" type="outline" icon="ios-list" href="/admin/questionarios/novo" />
            </div>
            <QuestionnaireList />
        </AppMainContainer>
    )
}