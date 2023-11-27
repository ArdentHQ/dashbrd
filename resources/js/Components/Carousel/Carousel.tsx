import cn from "classnames";
import React, { type ComponentProps } from "react";

import { useTranslation } from "react-i18next";
import { Autoplay, Grid, Navigation, Pagination } from "swiper";
import { Swiper } from "swiper/react";
import { type GridOptions, type Swiper as SwiperClass } from "swiper/types";
import { twMerge } from "tailwind-merge";
import { useCarouselAutoplay } from "./Hooks/useCarouselAutoplay";
import { IconButton } from "@/Components/Buttons";
import { ButtonLink } from "@/Components/Buttons/ButtonLink";
import { Heading } from "@/Components/Heading";
import { Icon } from "@/Components/Icon";
import { Link } from "@/Components/Link";

export { SwiperSlide as CarouselItem } from "swiper/react";

interface CarouselProperties extends Omit<ComponentProps<typeof Swiper>, "title"> {
    title?: string | React.ReactNode;
    carouselKey?: string;
    grid?: GridOptions;
    slidesPerView?: number | "auto";
    headerClassName?: string;
    swiperClassName?: string;
    horizontalOffset?: number;
    viewAllPath?: string;
    shouldShowHeader?: boolean;
    disabled?: boolean;
    navigationClass?: string;
}

export const CarouselControls = ({
    className,
    carouselKey,
    viewAllPath,
    title,
    disabled = false,
    navigationClass = "hidden space-x-3 lg:flex",
}: CarouselProperties): JSX.Element => {
    const { t } = useTranslation();

    return (
        <div
            data-testid="CarouselControls"
            className={cn("flex space-x-3", className)}
        >
            {viewAllPath !== undefined && (
                <div className="flex items-center">
                    <Link
                        className="ml-2 text-theme-primary-600 sm:hidden"
                        href={viewAllPath}
                    >
                        <Icon name="ArrowRight" />
                    </Link>

                    <ButtonLink
                        className="hidden sm:inline"
                        data-testid="CarouselControls__view-all"
                        variant="secondary"
                        href={viewAllPath}
                        title={String(title)}
                    >
                        {t("common.view_all")}
                    </ButtonLink>
                </div>
            )}

            <div className={navigationClass}>
                <CarouselPreviousButton
                    carouselKey={carouselKey}
                    disabled={disabled}
                />
                <CarouselNextButton
                    carouselKey={carouselKey}
                    disabled={disabled}
                />
            </div>
        </div>
    );
};

export const Carousel = ({
    children,
    carouselKey = "1",
    title,
    className,
    slidesPerView = "auto",
    headerClassName,
    swiperClassName,
    horizontalOffset,
    viewAllPath,
    shouldShowHeader = true,
    spaceBetween = 12,
    navigationClass,
    ...properties
}: CarouselProperties): JSX.Element => (
    <div className={className}>
        {shouldShowHeader && (
            <div className={cn("mb-3 flex items-center sm:justify-between", headerClassName)}>
                <Heading
                    level={2}
                    className="p-0"
                >
                    {title}
                </Heading>

                <CarouselControls
                    title={title}
                    carouselKey={carouselKey}
                    viewAllPath={viewAllPath}
                    navigationClass={navigationClass}
                />
            </div>
        )}

        <Swiper
            style={{ paddingRight: (horizontalOffset ?? 0) * 2 }}
            className={cn(swiperClassName)}
            modules={[Navigation, Grid, Pagination, Autoplay, Pagination]}
            slidesPerView={slidesPerView}
            spaceBetween={spaceBetween}
            slidesOffsetBefore={horizontalOffset}
            slidesOffsetAfter={(horizontalOffset ?? 0) * -1}
            pagination={{
                el: ".carousel-pagination",
                clickable: true,
            }}
            navigation={{
                nextEl: `.carousel-button-next-${carouselKey}`,
                prevEl: `.carousel-button-previous-${carouselKey}`,
            }}
            {...properties}
        >
            {children}
        </Swiper>
    </div>
);

export const CarouselPreviousButton = ({
    carouselKey = "1",
    disabled = false,
    className,
}: {
    carouselKey?: string;
    disabled?: boolean;
    className?: string;
}): JSX.Element => (
    <IconButton
        className={twMerge(
            `carousel-button-previous-${carouselKey} dark:border-theme-dark-700 dark:disabled:bg-theme-dark-900 dark:disabled:text-theme-dark-400`,
            className,
        )}
        data-testid="CarouselNavigationButtons__previous"
        icon="ChevronLeftSmall"
        iconSize="xs"
        disabled={disabled}
    />
);

export const CarouselNextButton = ({
    carouselKey = "1",
    className,
    disabled = false,
}: {
    carouselKey?: string;
    className?: string;
    disabled?: boolean;
}): JSX.Element => (
    <IconButton
        data-testid="CarouselNavigationButtons__next"
        className={twMerge(
            `carousel-button-next-${carouselKey} dark:border-theme-dark-700 dark:disabled:bg-theme-dark-900 dark:disabled:text-theme-dark-400`,
            className,
        )}
        icon="ChevronRightSmall"
        iconSize="xs"
        disabled={disabled}
    />
);

export const CarouselPagination = ({
    carouselInstance,
    autoplayDelay = 5000,
}: {
    carouselInstance?: SwiperClass;
    autoplayDelay: number;
}): JSX.Element => {
    const { activeIndex, progress } = useCarouselAutoplay({ carouselInstance, autoplayDelay });

    return (
        <div className="flex items-stretch space-x-2">
            {Array.from({ length: carouselInstance?.slides.length ?? 0 }, (_, index) => (
                <div
                    className="relative z-10 h-2 flex-grow cursor-pointer overflow-hidden rounded-full bg-theme-hint-200 dark:bg-theme-dark-700"
                    key={index}
                    onClick={() => {
                        carouselInstance?.slideTo(index);
                    }}
                >
                    <div
                        className={cn(
                            "transition-width absolute inset-y-0 left-0 bg-theme-hint-600 duration-200 ease-linear",
                        )}
                        style={{ width: index === activeIndex ? `${progress}%` : 0 }}
                    />
                </div>
            ))}
        </div>
    );
};
