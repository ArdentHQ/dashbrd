import { type ReactNode } from "react";
import { MyGallerySidebar } from "./Components/MyGallerySidebar";
import { type ToastMessage } from "@/Components/Toast";
import LeftMenuLayout from "@/Layouts/LeftMenuLayout";
import { SettingsListboxMenu } from "@/Pages/Settings/Components/SettingsListboxMenu";

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
        sidebarMenu={<MyGallerySidebar />}
        title={title}
    >
        {children}
    </LeftMenuLayout>
);

export default Layout;
