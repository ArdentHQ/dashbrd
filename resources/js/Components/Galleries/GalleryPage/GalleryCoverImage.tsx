import { Img } from "@/Components/Image";

export const GalleryCoverImage = ({ image }: { image: string }): JSX.Element => (
    <Img
        data-testid="GalleryCoverImage"
        wrapperClassName="mb-3 aspect-[3/2]"
        src={image}
        className="rounded-xl"
    />
);
