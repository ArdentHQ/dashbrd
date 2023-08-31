import { Img } from "@/Components/Image";

export const GalleryCoverImage = ({ image }: { image: string }): JSX.Element => (
    <div
        className="mb-3 aspect-[3/2]"
        data-testid="GalleryCoverImage"
    >
        <Img
            src={image}
            className="aspect-[3/2] min-w-full rounded-xl object-cover"
        />
    </div>
);
