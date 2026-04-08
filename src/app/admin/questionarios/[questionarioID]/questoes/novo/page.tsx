import { AppMainContainer } from "@/themes/components";
import QuestionForm from "./_form";

export const metadata = {
    title: 'Nova questão'
}

export default async function QuestaoNovaPage({ params }: any) {
    const { questionarioID } = await params;
    return (
        <AppMainContainer title="Nova questão">
            <QuestionForm questionnaireID={questionarioID} />
        </AppMainContainer>
    )
}