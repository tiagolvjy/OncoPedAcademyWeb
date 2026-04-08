import { AppMainContainer } from "@/themes/components";
import QuestionnaireEditForm from "./_form";

export const metadata = {
    title: 'Editar questionário'
}

export default async function QuestionarioEditarPage({ params }: any) {
    const { questionarioID } = await params;
    return (
        <AppMainContainer title="Editar questionário">
            <QuestionnaireEditForm questionnaireID={questionarioID} />
        </AppMainContainer>
    )
}