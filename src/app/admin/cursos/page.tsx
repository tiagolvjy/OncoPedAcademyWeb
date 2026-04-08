import { AppMainContainer } from "@/themes/components";
import CourseList from "./_list";
import { AppButton } from "@/themes/components";

export const metadata = {
    title: 'Cursos'
}

export default function CursosPage() {
    return (
        <AppMainContainer title="Cursos">
            <div className="flex justify-between items-center">
                <h1 className="font-bold text-[20px]">Lista de cursos</h1>
                <AppButton title='Novo curso' form="round" type="outline" icon="ios-book" href="/admin/cursos/novo" />
            </div>
            <CourseList />
        </AppMainContainer>
    )
}