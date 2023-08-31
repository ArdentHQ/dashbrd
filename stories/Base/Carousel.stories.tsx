import type { Meta } from "@storybook/react";
import Skeleton from "react-loading-skeleton";

import { Carousel, CarouselItem } from "@/Components/Carousel/Carousel";

export default {
    title: "Base/Carousel",
    component: Carousel,
    argTypes: {
        title: {
            control: "text",
            defaultValue: "Most Popular Galleries",
        },
    },
} as Meta<typeof Carousel>;

export const Default = {
    render: (args) => (
        <div>
            <Carousel title={args.title}>
                {[...Array(20)].map((_, index) => (
                    <CarouselItem key={index}>
                        <Skeleton
                            className="mr-3 rounded-xl"
                            width={312}
                            height={392}
                        />
                    </CarouselItem>
                ))}
            </Carousel>
        </div>
    ),
    args: {
        title: "Most Popular Galleries",
    },
};
