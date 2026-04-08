import { AppMainContainer } from "@/themes/components";
import LessonForm from "./_form";

export const metadata = {
    title: 'Nova aula'
}

export default async function AulaNovaPage({ params }: any) {
    const { courseID, moduleID } = await params;
    return (
        <AppMainContainer title="Nova aula">
            <LessonForm courseID={courseID} moduleID={moduleID} />
        </AppMainContainer>
    )
}