import { AppMainContainer } from "@/themes/components";
import ModuleEditForm from "./_form";

export const metadata = {
    title: 'Editar módulo'
}

export default async function ModuloEditarPage({ params }: any) {
    const { courseID, moduleID } = await params;
    return (
        <AppMainContainer title="Editar módulo">
            <ModuleEditForm courseID={courseID} moduleID={moduleID} />
        </AppMainContainer>
    )
}