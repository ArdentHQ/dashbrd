import { router } from "@inertiajs/react";
import { type ReactNode, useEffect, useState } from "react";
import { MyGalleryListboxMenu } from "./Components/MyGalleryListboxMenu";
import { MyGallerySidebar } from "./Components/MyGallerySidebar";
import LeftMenuLayout from "@/Layouts/LeftMenuLayout";
import { useGalleryDrafts } from "@/Pages/Galleries/hooks/useGalleryDrafts";
import { isTruthy } from "@/Utils/is-truthy";

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
    const { getDrafts } = useGalleryDrafts();

    const [drafts, setDrafts] = useState<number>();

    useEffect(() => {
        void (async () => {
            const allDrafts = await getDrafts();

            setDrafts(allDrafts.length);
        })();
    }, []);

    if (showDrafts && (!isTruthy(drafts) || drafts === 0)) {
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
