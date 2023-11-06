/* eslint-disable sonarjs/cognitive-complexity */
import cn from "classnames";
import { useCallback, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { type GridOptions } from "swiper/types";
import { Carousel, CarouselItem, CarouselNextButton, CarouselPreviousButton } from "@/Components/Carousel";
import { EmptyBlock } from "@/Components/EmptyBlock/EmptyBlock";
import { Tooltip } from "@/Components/Tooltip";
import { useBreakpoint } from "@/Hooks/useBreakpoint";
import { useIsTruncated } from "@/Hooks/useIsTruncated";
import { FormatPercentage } from "@/Utils/Percentage";

export const TraitsCarousel = ({
    traits = [],
}: {
    traits?: App.Data.Collections.CollectionTraitData[];
}): JSX.Element => {
    const { t } = useTranslation();

    const { isSm, isMd, isMdLg, isLg, isXlAndAbove } = useBreakpoint();

    const carouselOptions = useMemo((): {
        slidesPerView: number;
        spaceBetween: number;
        grid: Required<GridOptions>;
    } => {
        if (isXlAndAbove) {
            return {
                slidesPerView: 3,
                spaceBetween: 8,
                grid: {
                    rows: 2,
                    fill: "row",
                },
            };
        }

        if (isLg) {
            return {
                slidesPerView: 2,
                spaceBetween: 8,
                grid: {
                    rows: 2,
                    fill: "row",
                },
            };
        }

        if (isMdLg) {
            return {
                slidesPerView: 4,
                spaceBetween: 8,
                grid: {
                    rows: 2,
                    fill: "row",
                },
            };
        }

        if (isMd) {
            return {
                slidesPerView: 3,
                spaceBetween: 8,
                grid: {
                    rows: Math.ceil(traits.length / 3),
                    fill: "row",
                },
            };
        }

        if (isSm) {
            return {
                slidesPerView: 2,
                spaceBetween: 0,
                grid: {
                    rows: Math.ceil(traits.length / 2),
                    fill: "row",
                },
            };
        }

        return {
            slidesPerView: 1,
            spaceBetween: 0,
            grid: {
                rows: traits.length,
                fill: "row",
            },
        };
    }, [isSm, isMd, isMdLg, isLg, isXlAndAbove, traits]);

    const renderCarousel = (): JSX.Element => (
        <Carousel
            {...carouselOptions}
            shouldShowHeader={false}
        >
            {traits.map((trait, index) => {
                const valueReference = useRef<HTMLSpanElement>(null);
                const isValueTruncated = useIsTruncated({ reference: valueReference });

                const { isSm, isMdAndAbove } = useBreakpoint();

                const borderClassName = useCallback(
                    (index: number): string | undefined => {
                        if (isMdAndAbove) {
                            return;
                        }

                        if (isSm) {
                            if (traits.length - index > (traits.length % 2 === 0 ? 2 : 1)) {
                                return "border-b border-theme-secondary-300 border-dashed dark:border-theme-dark-700";
                            }
                        } else {
                            if (traits.length - index > 1) {
                                return "border-b border-theme-secondary-300 border-dashed dark:border-theme-dark-700";
                            }
                        }
                    },
                    [isSm, isMdAndAbove, traits],
                );

                return (
                    <CarouselItem
                        key={`${trait.name}_${trait.value}_${index}`}
                        className="sm:odd:pr-4 sm:even:pl-4 md:odd:p-0 md:even:p-0"
                    >
                        <div
                            className={cn(
                                "flex w-full justify-between py-4 font-medium md:flex-col md:space-y-2 md:rounded-lg md:bg-theme-secondary-50 md:px-4 md:py-3 lg:bg-white dark:md:bg-theme-dark-900",
                                borderClassName(index),
                            )}
                        >
                            <div className="flex flex-1 flex-col space-y-0.5 truncate">
                                <span className="text-xs leading-4.5 text-theme-secondary-500 dark:text-theme-dark-300 md:text-sm md:leading-5.5">
                                    {trait.name}
                                </span>
                                <div className="flex items-center justify-between text-sm leading-5.5 dark:text-theme-dark-50 md:text-base  md:leading-6">
                                    <Tooltip
                                        content={trait.value}
                                        disabled={!isValueTruncated}
                                    >
                                        <span
                                            ref={valueReference}
                                            className="truncate whitespace-nowrap dark:text-theme-dark-50"
                                        >
                                            {trait.value}
                                        </span>
                                    </Tooltip>

                                    <span className="ml-2 hidden text-theme-secondary-700 dark:text-theme-dark-200 md:inline">
                                        <FormatPercentage
                                            value={trait.nftsPercentage / 100}
                                            decimals={2}
                                        />
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-col items-end">
                                <span className="mb-1.5 text-sm leading-5.5 text-theme-secondary-700 dark:text-theme-dark-200 md:hidden">
                                    <FormatPercentage
                                        value={trait.nftsPercentage / 100}
                                        decimals={2}
                                    />{" "}
                                    {t("pages.collections.rarity")}
                                </span>

                                <div className="relative h-2 w-25 bg-theme-primary-200 dark:bg-theme-dark-700 md:w-full">
                                    <div
                                        className="left-0 h-full bg-theme-primary-600 md:absolute"
                                        style={{ width: `${trait.nftsPercentage}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </CarouselItem>
                );
            })}
        </Carousel>
    );

    return (
        <div data-testid="TraitsCarousel">
            <div className="mb-3 hidden items-end justify-between lg:flex">
                <div className="flex flex-col space-y-0.5 font-medium">
                    <div className="flex items-center gap-2.5">
                        <span className="leading-6 dark:text-theme-dark-50">{t("pages.collections.properties")}</span>
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-theme-secondary-200 backdrop-blur-md dark:bg-theme-dark-900">
                            <span className="text-sm font-medium leading-5.5 text-theme-secondary-700 dark:text-theme-dark-200">
                                {traits.length}
                            </span>
                        </div>
                    </div>

                    <span className="text-sm leading-5.5 text-theme-secondary-700 dark:text-theme-dark-200">
                        {t("pages.collections.traits.description")}
                    </span>
                </div>

                <div
                    data-testid="TraitsCarousel__controls"
                    className={cn(
                        "traits-carousel-controls items-center space-x-3",
                        traits.length > carouselOptions.slidesPerView * carouselOptions.grid.rows ? "flex" : "hidden",
                    )}
                >
                    <CarouselPreviousButton />
                    <CarouselNextButton />
                </div>
            </div>

            {traits.length > 0 ? (
                <div className="w-full overflow-auto">{renderCarousel()}</div>
            ) : (
                <EmptyBlock data-testid="TraitsCarousel_hasNoTraits">
                    {t("pages.collections.traits.no_traits")}
                </EmptyBlock>
            )}
        </div>
    );
};
