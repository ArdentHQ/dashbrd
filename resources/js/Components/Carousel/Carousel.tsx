import cn from "classnames";
import React, { type ComponentProps } from "react";

import { useTranslation } from "react-i18next";
import { Grid, Navigation, Pagination } from "swiper";
import { Swiper } from "swiper/react";
import { type GridOptions } from "swiper/types";
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
            modules={[Navigation, Grid, Pagination]}
            slidesPerView={slidesPerView}
            spaceBetween={spaceBetween}
            slidesOffsetBefore={horizontalOffset}
            slidesOffsetAfter={(horizontalOffset ?? 0) * -1}
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
}: {
    carouselKey?: string;
    disabled?: boolean;
}): JSX.Element => (
    <IconButton
        className={`carousel-button-previous-${carouselKey} dark:border-theme-dark-700 dark:disabled:bg-theme-dark-900 dark:disabled:text-theme-dark-400`}
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
        className={cn(
            `carousel-button-next-${carouselKey} dark:border-theme-dark-700 dark:disabled:bg-theme-dark-900 dark:disabled:text-theme-dark-400`,
            className,
        )}
        icon="ChevronRightSmall"
        iconSize="xs"
        disabled={disabled}
    />
);
