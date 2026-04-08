import { AppMainContainer } from "@/themes/components";
import CourseDetails from "./_details";

export const metadata = {
    title: 'Detalhes do curso'
}

export default async function CursoDetalhesPage({ params }: any) {
    const { courseID } = await params;
    return (
        <AppMainContainer title="Detalhes do curso">
            <CourseDetails courseID={courseID} />
        </AppMainContainer>
    )
}