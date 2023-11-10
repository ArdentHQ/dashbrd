import { type ReactNode } from "react";
import { MyGalleryListboxMenu } from "./Components/MyGalleryListboxMenu";
import { MyGallerySidebar } from "./Components/MyGallerySidebar";
import { useDraftGalleriesContext } from "@/Contexts/DraftGalleriesContext";
import LeftMenuLayout from "@/Layouts/LeftMenuLayout";

const Layout = ({
    title,
    children,
    nftCount,
    galleryCount,
}: {
    title: string;
    children: ReactNode;
    nftCount: number;
    galleryCount: number;
}): JSX.Element => {
    const { drafts } = useDraftGalleriesContext();

    return (
        <LeftMenuLayout
            mobileMenu={
                <MyGalleryListboxMenu
                    nftCount={nftCount}
                    publishedCount={galleryCount}
                    draftsCount={drafts?.length ?? 0}
                />
            }
            sidebarMenu={
                <MyGallerySidebar
                    publishedCount={galleryCount}
                    draftsCount={drafts?.length ?? 0}
                />
            }
            title={title}
        >
            {children}
        </LeftMenuLayout>
    );
};

export default Layout;
