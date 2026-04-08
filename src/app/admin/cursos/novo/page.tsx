import { AppMainContainer } from "@/themes/components";
import CourseForm from "./_form";

export const metadata = {
    title: 'Novo curso'
}

export default function CursosNovoPage() {
    return (
        <AppMainContainer title="Novo curso">
            <CourseForm />
        </AppMainContainer>
    )
}