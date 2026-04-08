import { AppMainContainer } from "@/themes/components";
import QuestionEditForm from "./_form";

export const metadata = {
    title: 'Editar questão'
}

export default async function QuestaoEditarPage({ params }: any) {
    const { questionarioID, questaoID } = await params;
    return (
        <AppMainContainer title="Editar questão">
            <QuestionEditForm questionnaireID={questionarioID} questionID={questaoID} />
        </AppMainContainer>
    )
}