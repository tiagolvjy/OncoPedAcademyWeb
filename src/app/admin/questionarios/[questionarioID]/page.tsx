import { AppMainContainer } from "@/themes/components";
import QuestionnaireDetails from "./_details";

export const metadata = {
    title: 'Detalhes do questionário'
}

export default async function QuestionarioDetalhesPage({ params }: any) {
    const { questionarioID } = await params;
    return (
        <AppMainContainer title="Detalhes do questionário">
            <QuestionnaireDetails questionnaireID={questionarioID} />
        </AppMainContainer>
    )
}