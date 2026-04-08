import { AppMainContainer } from "@/themes/components";
import LessonEditForm from "./_form";

export const metadata = {
    title: 'Editar aula'
}

export default async function AulaEditarPage({ params }: any) {
    const { courseID, moduleID, lessonID } = await params;
    return (
        <AppMainContainer title="Editar aula">
            <LessonEditForm courseID={courseID} moduleID={moduleID} lessonID={lessonID} />
        </AppMainContainer>
    )
}