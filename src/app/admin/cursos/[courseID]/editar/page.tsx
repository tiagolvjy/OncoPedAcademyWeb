import { AppMainContainer } from "@/themes/components";
import CourseEditForm from "./_form";

export const metadata = {
    title: 'Editar curso'
}

export default async function CursosEditarPage({ params }: any) {
    const { courseID } = await params;
    return (
        <AppMainContainer title="Editar curso">
            <CourseEditForm courseID={courseID} />
        </AppMainContainer>
    )
}