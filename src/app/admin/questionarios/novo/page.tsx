import { AppMainContainer } from "@/themes/components";
import QuestionnaireForm from "./_form";

export const metadata = {
    title: 'Novo questionário'
}

export default function QuestionariosNovoPage() {
    return (
        <AppMainContainer title="Novo questionário">
            <QuestionnaireForm />
        </AppMainContainer>
    )
}