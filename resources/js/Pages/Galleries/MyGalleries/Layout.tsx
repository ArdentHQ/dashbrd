import { router } from "@inertiajs/react";
import { type ReactNode, useEffect, useState } from "react";
import { MyGalleryListboxMenu } from "./Components/MyGalleryListboxMenu";
import { MyGallerySidebar } from "./Components/MyGallerySidebar";
import { useDraftGalleriesContext } from "@/Contexts/DraftGalleriesContext";
import LeftMenuLayout from "@/Layouts/LeftMenuLayout";

const Layout = ({
    title,
    children,
    nftCount,
    galleryCount,
    showDrafts,
}: {
    title: string;
    children: ReactNode;
    nftCount: number;
    galleryCount: number;
    showDrafts: boolean;
}): JSX.Element => {
    const { drafts } = useDraftGalleriesContext();

    if (showDrafts && drafts === 0) {
        router.visit(
            route("my-galleries", {
                draft: false,
            }),
        );
    }

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
