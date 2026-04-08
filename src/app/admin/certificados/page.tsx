import { AppMainContainer } from "@/themes/components";
import CertificateList from "./_list";

export const metadata = {
    title: 'Certificados'
}

export default function CertificadosPage() {
    return (
        <AppMainContainer title="Certificados">
            <div className="flex justify-between items-center"> 
                <h1 className="font-bold text-[20px]">Certificados emitidos</h1>
            </div>
            <CertificateList />
        </AppMainContainer>
    )
}