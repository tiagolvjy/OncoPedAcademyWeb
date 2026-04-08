import { AppMainContainer } from "@/themes/components";
import DashboardContent from "./_content";

export const metadata = {
    title: 'Dashboard'
}

export default function DashboardPage() {
    return (
        <AppMainContainer title="Dashboard">
            <DashboardContent />
        </AppMainContainer>
    )
}