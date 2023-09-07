import { Head, router } from "@inertiajs/react";
import { type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/Components/Buttons";
import { NftGalleryCard } from "@/Components/Galleries";
import { Heading } from "@/Components/Heading";
import { Icon } from "@/Components/Icon";
import { LayoutWrapper } from "@/Components/Layout/LayoutWrapper";
import { Pagination } from "@/Components/Pagination";
import { Tooltip } from "@/Components/Tooltip";
import { useAuthorizedAction } from "@/Hooks/useAuthorizedAction";

const Index = ({
    title,
    galleries,
    nftCount = 0,
}: {
    title: string;
    children: ReactNode;
    galleries: App.Data.Gallery.GalleriesData;
}): JSX.Element => {
    const { t } = useTranslation();

    const userGalleries = galleries.paginated;

    const createGalleryUrl = route("my-galleries.create");

    const { signedAction } = useAuthorizedAction();

    return (
        <LayoutWrapper>
            <Head title={title} />

            <div className="mx-6 sm:mx-8 2xl:mx-0">
                <div className="mb-6 flex w-full items-center justify-between">
                    <Heading level={1}>
                        <span className="leading-tight text-theme-secondary-800">
                            {t("pages.galleries.my_galleries.title")}
                        </span>
                    </Heading>

                    {nftCount === 0 && (
                        <>
                            <Tooltip content={t("pages.galleries.my_galleries.new_gallery_no_nfts")}>
                                <div className="sm:hidden">
                                    <Button
                                        icon="Plus"
                                        variant="icon-primary"
                                        disabled={true}
                                    />
                                </div>
                            </Tooltip>

                            <Tooltip content={t("pages.galleries.my_galleries.new_gallery_no_nfts")}>
                                <div className="hidden sm:block">
                                    <Button disabled={true}>
                                        <span className="flex items-center space-x-2">
                                            <Icon
                                                name="Plus"
                                                size="md"
                                            />
                                            <span>{t("pages.galleries.my_galleries.new_gallery")}</span>
                                        </span>
                                    </Button>
                                </div>
                            </Tooltip>
                        </>
                    )}

                    {nftCount > 0 && (
                        <>
                            <Button
                                onClick={() => {
                                    signedAction(() => {
                                        router.get(createGalleryUrl);
                                    });
                                }}
                                className="sm:hidden"
                                icon="Plus"
                                variant="icon-primary"
                            ></Button>

                            <Button
                                onClick={() => {
                                    signedAction(() => {
                                        router.get(createGalleryUrl);
                                    });
                                }}
                                className="hidden sm:block"
                            >
                                <span className="flex items-center space-x-2">
                                    <Icon
                                        name="Plus"
                                        size="md"
                                    />
                                    <span>{t("pages.galleries.my_galleries.new_gallery")}</span>
                                </span>
                            </Button>
                        </>
                    )}
                </div>

                {userGalleries.meta.total === 0 && (
                    <div className="flex items-center justify-center rounded-xl border border-theme-secondary-300 p-4">
                        <span className="text-center font-medium text-theme-secondary-700">
                            {t("pages.galleries.my_galleries.no_galleries")}
                        </span>
                    </div>
                )}

                {userGalleries.meta.total > 0 && (
                    <div className="-m-1 grid grid-flow-row grid-cols-1 gap-2 sm:grid-cols-2 md-lg:grid-cols-3 xl:grid-cols-4">
                        {userGalleries.data.map((gallery, index) => (
                            <NftGalleryCard
                                key={index}
                                gallery={gallery}
                            />
                        ))}
                    </div>
                )}

                {userGalleries.meta.last_page > 1 && (
                    <Pagination
                        className="mb-6 mt-6 flex w-full items-center justify-center lg:mb-0"
                        data={userGalleries}
                    />
                )}
            </div>
        </LayoutWrapper>
    );
};

export default Index;
