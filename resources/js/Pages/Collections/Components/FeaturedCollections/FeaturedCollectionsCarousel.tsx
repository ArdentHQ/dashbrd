import React from "react";
import { Autoplay, Navigation, Pagination } from "swiper";
import { FeaturedCollectionsItem } from "./FeaturedCollectionsItem";
import { Carousel, CarouselItem } from "@/Components/Carousel";

export const FeaturedCollectionsCarousel = ({
    featuredCollections,
}: {
    featuredCollections: App.Data.Collections.CollectionFeaturedData[];
}): JSX.Element => (
    <Carousel
        shouldShowHeader={false}
        loop={true}
        className="overflow-hidden lg:mx-8 lg:rounded-xl lg:border lg:border-theme-secondary-300 dark:lg:border-theme-dark-700 2xl:mx-0"
        navigation={true}
        autoplay={{
            delay: 5000,
            pauseOnMouseEnter: true,
        }}
        modules={[Navigation, Pagination, Autoplay]}
    >
        {featuredCollections.map((collection, index) => (
            <CarouselItem key={index}>
                <FeaturedCollectionsItem data={collection} />
            </CarouselItem>
        ))}
    </Carousel>
);
