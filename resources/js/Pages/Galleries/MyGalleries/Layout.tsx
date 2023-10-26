import { type ReactNode } from "react";
import { type ToastMessage } from "@/Components/Toast";
import LeftMenuLayout from "@/Layouts/LeftMenuLayout";
import { SettingsListboxMenu } from "@/Pages/Settings/Components/SettingsListboxMenu";
import { SettingsSidebar } from "@/Pages/Settings/Components/SettingsSidebar";

const Layout = ({
    title,
    toastMessage,
    children,
    mustBeSigned = false,
    showBackButton,
}: {
    title: string;
    children: ReactNode;
    toastMessage?: ToastMessage;
    mustBeSigned?: boolean;
    showBackButton?: boolean;
}): JSX.Element => (
    <LeftMenuLayout
        toastMessage={toastMessage}
        mustBeSigned={mustBeSigned}
        showBackButton={showBackButton}
        mobileMenu={<SettingsListboxMenu />}
        sidebarMenu={<SettingsSidebar />}
        title={title}
    >
        {children}
    </LeftMenuLayout>
);

export default Layout;
