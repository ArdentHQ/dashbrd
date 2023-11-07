import { type ReactNode, useEffect, useState } from "react";
import { MyGalleryListboxMenu } from "./Components/MyGalleryListboxMenu";
import { MyGallerySidebar } from "./Components/MyGallerySidebar";
import LeftMenuLayout from "@/Layouts/LeftMenuLayout";
import { useGalleryDrafts } from "@/Pages/Galleries/hooks/useGalleryDrafts";

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
    const { getDrafts } = useGalleryDrafts();

    const [drafts, setDrafts] = useState<number>();

    useEffect(() => {
        void (async () => {
            const allDrafts = await getDrafts();

            setDrafts(allDrafts.length);
        })();
    }, []);

    return (
        <LeftMenuLayout
            mobileMenu={
                <MyGalleryListboxMenu
                    nftCount={nftCount}
                    publishedCount={galleryCount}
                    draftsCount={drafts}
                />
            }
            sidebarMenu={
                <MyGallerySidebar
                    publishedCount={galleryCount}
                    draftsCount={drafts}
                />
            }
            title={title}
        >
            {children}
        </LeftMenuLayout>
    );
};

export default Layout;
