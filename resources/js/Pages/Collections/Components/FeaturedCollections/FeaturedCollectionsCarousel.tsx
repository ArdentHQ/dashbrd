import React, { useState } from "react";
import type Swiper from "swiper";
import { FeaturedCollectionsItem } from "./FeaturedCollectionsItem";
import {
    Carousel,
    CarouselItem,
    CarouselNextButton,
    CarouselPagination,
    CarouselPreviousButton,
} from "@/Components/Carousel";

export const FeaturedCollectionsCarousel = ({
    featuredCollections,
    autoplayDelay = 5000,
}: {
    featuredCollections: App.Data.Collections.CollectionFeaturedData[];
    autoplayDelay?: number;
}): JSX.Element => {
    const [carousel, setCarousel] = useState<Swiper>();

    return (
        <div>
            <div className="relative">
                <div className="hidden lg:block">
                    <div className="absolute inset-y-0 left-3 z-10 flex h-full items-center 2xl:-left-5">
                        <CarouselPreviousButton
                            carouselKey="featuredCollections"
                            className="shadow-carousel-button-light dark:shadow-carousel-button-dark border-none disabled:opacity-0 dark:bg-theme-dark-700"
                        />
                    </div>
                </div>

                <Carousel
                    carouselKey="featuredCollections"
                    shouldShowHeader={false}
                    className="overflow-hidden lg:mx-8 lg:rounded-xl lg:border lg:border-theme-secondary-300 dark:lg:border-theme-dark-700 2xl:mx-0"
                    onSwiper={setCarousel}
                    autoHeight
                    autoplay={{
                        delay: autoplayDelay,
                        pauseOnMouseEnter: true,
                    }}
                >
                    {featuredCollections.map((collection, index) => (
                        <CarouselItem key={index}>
                            <FeaturedCollectionsItem data={collection} />
                        </CarouselItem>
                    ))}
                </Carousel>

                <div className="hidden lg:block">
                    <div className="absolute inset-y-0 right-3 z-10 flex h-full items-center 2xl:-right-5">
                        <CarouselNextButton
                            carouselKey="featuredCollections"
                            className="shadow-carousel-button-light dark:shadow-carousel-button-dark border-none disabled:opacity-0 dark:bg-theme-dark-700"
                        />
                    </div>
                </div>
            </div>

            <div className="mx-auto -mt-6 max-w-[16.5rem] md-lg:mt-2">
                <CarouselPagination
                    carouselInstance={carousel}
                    autoplayDelay={autoplayDelay}
                />
            </div>
        </div>
    );
};
