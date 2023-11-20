import { type ReactNode } from "react";
import { MyGalleryListboxMenu } from "./Components/MyGalleryListboxMenu";
import { MyGallerySidebar } from "./Components/MyGallerySidebar";
import LeftMenuLayout from "@/Layouts/LeftMenuLayout";

interface Properties {
    title: string;
    children: ReactNode;
    nftCount: number;
    galleryCount: number;
    draftsCount: number;
    isLoadingDrafts: boolean;
}

const Layout = ({ title, children, nftCount, galleryCount, draftsCount, isLoadingDrafts }: Properties): JSX.Element => (
    <LeftMenuLayout
        mobileMenu={
            <MyGalleryListboxMenu
                nftCount={nftCount}
                publishedCount={galleryCount}
                draftsCount={draftsCount}
            />
        }
        sidebarMenu={
            <MyGallerySidebar
                publishedCount={galleryCount}
                draftsCount={draftsCount}
                isLoadingDrafts={isLoadingDrafts}
            />
        }
        title={title}
    >
        {children}
    </LeftMenuLayout>
);
export default Layout;
