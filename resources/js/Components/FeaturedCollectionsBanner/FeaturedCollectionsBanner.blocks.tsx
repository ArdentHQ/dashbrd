import classNames from "classnames";
import { useMemo, useState } from "react";
import type Swiper from "swiper";
import { Carousel, CarouselItem, CarouselNextButton, CarouselPreviousButton } from "@/Components/Carousel";
import { Img } from "@/Components/Image";
import { Link } from "@/Components/Link";
import { Tooltip } from "@/Components/Tooltip";
import { useBreakpoint } from "@/Hooks/useBreakpoint";

export const CollectionCarousel = ({
    collections = [],
    className,
}: {
    className?: string;
    collections?: Array<Pick<App.Data.Nfts.NftCollectionData, "name" | "image" | "slug">>;
}): JSX.Element => {
    const { isSm, isMdAndAbove, isLgAndAbove, isXlAndAbove } = useBreakpoint();
    const [showButtons, setShowButtons] = useState(false);

    const checkIfRequiresNavigation = (swiper: Swiper): void => {
        const { isLocked } = swiper;

        setShowButtons(!isLocked);
    };

    const slidesPerView = useMemo((): number => {
        if (isXlAndAbove) {
            if (collections.length <= 11) {
                return 11;
            }

            return 10;
        }

        if (isLgAndAbove) {
            if (collections.length <= 7) {
                return 7;
            }

            return 6;
        }

        if (isMdAndAbove) {
            if (collections.length <= 8) {
                return 8;
            }

            return 7;
        }

        if (isSm) {
            return 7;
        }

        return 3;
    }, [isXlAndAbove, isLgAndAbove, isMdAndAbove, isSm, showButtons, collections]);

    const carouselWidth = useMemo((): number => {
        const gap = 16;
        const slides = Math.min(collections.length, slidesPerView);
        return slides * 60 + (slides - 1) * gap;
    }, [slidesPerView, collections]);

    const renderCarousel = (): JSX.Element => {
        if (collections.length === 0) {
            return (
                <div
                    data-testid="CollectionCarousel__entry__no_image"
                    className="aspect-square h-15 w-15 rounded-full border border-theme-secondary-300 bg-white object-cover"
                />
            );
        }

        return (
            <Carousel
                slidesPerView={Math.min(collections.length, slidesPerView)}
                shouldShowHeader={false}
                onUpdate={checkIfRequiresNavigation}
                spaceBetween={16}
            >
                {collections.map((collection, index) => (
                    <CarouselItem
                        key={index}
                        className="flex justify-center"
                    >
                        <Link
                            href={route("collections.view", {
                                slug: collection.slug,
                            })}
                        >
                            <Tooltip
                                content={collection.name}
                                offset={[0, 12]}
                            >
                                <div>
                                    {collection.image !== null && (
                                        <div
                                            className="h-15 w-15 shrink-0 rounded-full bg-white"
                                            data-testid={`CollectionCarousel__entry--${index}`}
                                        >
                                            <Img
                                                className="h-15 w-15 rounded-full"
                                                src={collection.image}
                                            />
                                        </div>
                                    )}

                                    {collection.image === null && (
                                        <div
                                            data-testid={`CollectionCarousel__entry__no_image--${index}`}
                                            className="h-15 w-15 rounded-full border border-theme-secondary-300 bg-white"
                                        />
                                    )}
                                </div>
                            </Tooltip>
                        </Link>
                    </CarouselItem>
                ))}
            </Carousel>
        );
    };

    return (
        <div
            data-testid="CollectionCarousel"
            className={classNames(
                "flex w-full flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0",
                className,
            )}
        >
            <div
                data-testid={showButtons ? "CollectionCarousel--button" : "CollectionCarousel--button--hidden"}
                className={classNames("mr-4 w-10 flex-shrink-0 justify-center", {
                    flex: showButtons,
                    hidden: !showButtons,
                })}
            >
                <div className="hidden md:block">
                    <CarouselPreviousButton />
                </div>
            </div>

            <div
                className="w-full overflow-auto"
                style={{
                    width: `${carouselWidth}px`,
                }}
            >
                {renderCarousel()}
            </div>

            <div
                className={classNames("ml-4 w-10 flex-shrink-0 justify-center space-x-3 md:space-x-0", {
                    flex: showButtons,
                    hidden: !showButtons,
                })}
            >
                <div className="block md:hidden">
                    <CarouselPreviousButton />
                </div>

                <CarouselNextButton className="flex-shrink-0" />
            </div>
        </div>
    );
};
