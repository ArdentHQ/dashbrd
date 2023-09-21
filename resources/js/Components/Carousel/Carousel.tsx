import cn from "classnames";
import React, { type ComponentProps } from "react";

import { useTranslation } from "react-i18next";
import { Grid, Navigation } from "swiper";
import { Swiper } from "swiper/react";
import { type GridOptions } from "swiper/types";
import { IconButton } from "@/Components/Buttons";
import { ButtonLink } from "@/Components/Buttons/ButtonLink";
import { Heading } from "@/Components/Heading";
import { Icon } from "@/Components/Icon";
import { Link } from "@/Components/Link";

export { SwiperSlide as CarouselItem } from "swiper/react";

interface CarouselProperties extends ComponentProps<typeof Swiper> {
    title?: string;
    carouselKey?: string;
    grid?: GridOptions;
    slidesPerView?: number | "auto";
    headerClassName?: string;
    swiperClassName?: string;
    horizontalOffset?: number;
    viewAllPath?: string;
    shouldShowHeader?: boolean;
    disabled?: boolean;
}

export const CarouselControls = ({
    className,
    carouselKey,
    viewAllPath = "",
    title,
    disabled = false,
}: CarouselProperties): JSX.Element => {
    const { t } = useTranslation();

    return (
        <div
            data-testid="CarouselControls"
            className={cn("flex space-x-3", className)}
        >
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
                    title={title}
                >
                    {t("common.view_all")}
                </ButtonLink>
            </div>

            <div className="hidden space-x-3 lg:flex">
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
                />
            </div>
        )}

        <Swiper
            style={{ paddingRight: (horizontalOffset ?? 0) * 2 }}
            className={cn(swiperClassName)}
            modules={[Navigation, Grid]}
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
        className={`carousel-button-previous-${carouselKey}`}
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
        className={cn(`carousel-button-next-${carouselKey}`, className)}
        icon="ChevronRightSmall"
        iconSize="xs"
        disabled={disabled}
    />
);
