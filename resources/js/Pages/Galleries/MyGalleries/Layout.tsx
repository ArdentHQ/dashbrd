import { type ReactNode } from "react";
import { MyGalleryListboxMenu } from "./Components/MyGalleryListboxMenu";
import { MyGallerySidebar } from "./Components/MyGallerySidebar";
import LeftMenuLayout from "@/Layouts/LeftMenuLayout";

const Layout = ({
    title,
    children,
    nftCount,
}: {
    title: string;
    children: ReactNode;
    nftCount: number;
}): JSX.Element => (
    <LeftMenuLayout
        mobileMenu={<MyGalleryListboxMenu nftCount={nftCount} />}
        // temporary use the nftCount from the current page
        sidebarMenu={
            <MyGallerySidebar
                publishedCount={nftCount}
                draftsCount={0}
            />
        }
        title={title}
    >
        {children}
    </LeftMenuLayout>
);

export default Layout;
