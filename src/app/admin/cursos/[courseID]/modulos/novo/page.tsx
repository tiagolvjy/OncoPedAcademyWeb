import { AppMainContainer } from "@/themes/components";
import ModuleForm from "./_form";

export const metadata = {
    title: 'Novo módulo'
}

export default async function ModuloNovoPage({ params }: any) {
    const { courseID } = await params;
    return (
        <AppMainContainer title="Novo módulo">
            <ModuleForm courseID={courseID} />
        </AppMainContainer>
    )
}