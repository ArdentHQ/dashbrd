import React from "react";
import { NftGalleryCardEditable } from "@/Components/Galleries/NftGalleryCardEditable";
import { SliderContext } from "@/Components/Slider";
import GalleryNftDataFactory from "@/Tests/Factories/Gallery/GalleryNftDataFactory";
import { render, screen, userEvent } from "@/Tests/testing-library";

const nft = new GalleryNftDataFactory().withImages().create();

describe("NftGalleryCardEditable", () => {
    describe("without nft", () => {
        it("should render", () => {
            const function_ = vi.fn();

            render(
                <SliderContext.Provider value={{ isOpen: false, setOpen: function_ }}>
                    <NftGalleryCardEditable isSelected={false} />
                </SliderContext.Provider>,
            );

            expect(screen.getByTestId("NftGalleryCardEditable")).toBeInTheDocument();
            expect(screen.queryByTestId("NftGalleryCardEditable__item")).not.toBeInTheDocument();
        });

        it("should call the on add method when clicking on an empty space", async () => {
            const onAdd = vi.fn();

            render(
                <NftGalleryCardEditable
                    isSelected={false}
                    onAdd={onAdd}
                />,
            );

            expect(screen.getByTestId("NftGalleryCardEditable")).toBeInTheDocument();
            expect(screen.queryByTestId("NftGalleryCardEditable__item")).not.toBeInTheDocument();

            await userEvent.click(screen.getByTestId("NftGalleryCardEditable"));

            expect(onAdd).toHaveBeenCalled();
        });
    });

    describe("with nft", () => {
        it("should not show the nft if no large image", () => {
            render(
                <NftGalleryCardEditable
                    nft={{
                        ...nft,
                        images: {
                            ...nft.images,
                            large: null,
                        },
                    }}
                    isSelected={false}
                />,
            );

            expect(screen.queryByTestId("NftGalleryCardEditable__image")).not.toBeInTheDocument();
        });

        it("should call the on add method when clicking add button", async () => {
            const onAdd = vi.fn();

            render(
                <NftGalleryCardEditable
                    nft={nft}
                    isSelected={false}
                    onAdd={onAdd}
                />,
            );

            expect(screen.getByTestId("NftGalleryCardEditable__image")).toBeInTheDocument();
            expect(screen.getByTestId("GalleryCard")).toBeInTheDocument();

            await userEvent.click(screen.getByTestId("NftGalleryCardEditable__add"));

            expect(onAdd).toHaveBeenCalled();
        });

        it("should call the on remove method when clicking delete button", async () => {
            const onRemove = vi.fn();

            render(
                <NftGalleryCardEditable
                    nft={nft}
                    isSelected={false}
                    onRemove={onRemove}
                />,
            );

            expect(screen.getByTestId("NftGalleryCardEditable__image")).toBeInTheDocument();
            expect(screen.getByTestId("GalleryCard")).toBeInTheDocument();

            await userEvent.click(screen.getByTestId("NftGalleryCardEditable__delete"));

            expect(onRemove).toHaveBeenCalled();
        });

        it.each([true, false])("should execute onClick callback with isSelected = %s", async (isSelected) => {
            const onClick = vi.fn();

            render(
                <NftGalleryCardEditable
                    nft={nft}
                    isSelected={isSelected}
                    onClick={onClick}
                />,
            );

            expect(screen.getByTestId("NftGalleryCardEditable__image")).toBeInTheDocument();
            expect(screen.getByTestId("GalleryCard")).toBeInTheDocument();

            await userEvent.click(screen.getByTestId("GalleryCard"));

            expect(onClick).toHaveBeenCalledWith(isSelected ? undefined : `${nft.tokenNumber}_${nft.id}`);
        });
    });
});
