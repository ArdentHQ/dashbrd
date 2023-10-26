import { type ReactNode } from "react";
import { MyGalleryListboxMenu } from "./Components/MyGalleryListboxMenu";
import { MyGallerySidebar } from "./Components/MyGallerySidebar";
import { type ToastMessage } from "@/Components/Toast";
import LeftMenuLayout from "@/Layouts/LeftMenuLayout";

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
        mobileMenu={<MyGalleryListboxMenu />}
        sidebarMenu={<MyGallerySidebar />}
        title={title}
    >
        {children}
    </LeftMenuLayout>
);

export default Layout;
