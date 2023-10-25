import React from "react";
import { EditableGalleryHook, GalleryContext } from "./Hooks/useEditableGalleryContext";
import { NftGridEditable } from "./NftGridEditable";
import { GalleryNfts } from "@/Components/Galleries/Hooks/useGalleryNftsContext";
import { SliderContext } from "@/Components/Slider";
import * as useMetaMaskContext from "@/Contexts/MetaMaskContext";
import GalleryNftDataFactory from "@/Tests/Factories/Gallery/GalleryNftDataFactory";
import { BASE_URL, requestMock, server } from "@/Tests/Mocks/server";
import { SamplePageMeta } from "@/Tests/SampleData";
import { getSampleMetaMaskState } from "@/Tests/SampleData/SampleMetaMaskState";
import { fireEvent, render, screen, userEvent } from "@/Tests/testing-library";
const nft = new GalleryNftDataFactory().withImages().create();

describe("NftGridEditable", () => {
    beforeEach(() => {
        server.use(
            requestMock(BASE_URL, {
                nfts: [nft],
                collections: {
                    paginated: {
                        data: [],
                        ...SamplePageMeta.paginated,
                    },
                },
            }),
        );

        vi.spyOn(useMetaMaskContext, "useMetaMaskContext").mockReturnValue(getSampleMetaMaskState());
    });

    afterAll(() => {
        vi.restoreAllMocks();
    });

    it("should render", () => {
        const function_ = vi.fn();

        render(
            <SliderContext.Provider value={{ isOpen: false, setOpen: function_ }}>
                <EditableGalleryHook
                    selectedNfts={[nft]}
                    nftLimit={16}
                >
                    <GalleryNfts
                        nfts={[nft]}
                        pageMeta={{
                            ...SamplePageMeta.paginated.meta,
                            next_page_url: undefined,
                            per_page: undefined,
                            total: undefined,
                        }}
                    >
                        <NftGridEditable />
                    </GalleryNfts>
                </EditableGalleryHook>
            </SliderContext.Provider>,
        );

        expect(screen.getAllByTestId("NftGalleryCardEditable__item--empty")).toHaveLength(15);
        expect(screen.getAllByTestId("NftGalleryCardEditable__item")).toHaveLength(1);
    });

    it("should render error state", () => {
        const function_ = vi.fn();

        render(
            <SliderContext.Provider value={{ isOpen: false, setOpen: function_ }}>
                <EditableGalleryHook
                    selectedNfts={[]}
                    nftLimit={16}
                >
                    <GalleryNfts
                        nfts={[]}
                        pageMeta={{
                            ...SamplePageMeta.paginated.meta,
                            next_page_url: undefined,
                            per_page: undefined,
                            total: undefined,
                        }}
                    >
                        <NftGridEditable error="some error" />
                    </GalleryNfts>
                </EditableGalleryHook>
            </SliderContext.Provider>,
        );

        expect(screen.getAllByTestId("NftGalleryCardEditable__item--empty")).toHaveLength(16);
        expect(screen.getByText("some error")).toBeInTheDocument();
    });

    it("should remove nft when clicked", async () => {
        const addNftMock = vi.fn();
        const removeNftMock = vi.fn();

        const function_ = vi.fn();

        render(
            <SliderContext.Provider value={{ isOpen: false, setOpen: function_ }}>
                <GalleryContext.Provider
                    value={{
                        nfts: {
                            selected: [nft],
                            add: addNftMock,
                            update: vi.fn(),
                            remove: removeNftMock,
                        },
                        nftLimit: 16,
                    }}
                >
                    <GalleryNfts
                        nfts={[]}
                        pageMeta={SamplePageMeta.paginated.meta}
                    >
                        <NftGridEditable />
                    </GalleryNfts>
                </GalleryContext.Provider>
            </SliderContext.Provider>,
        );

        expect(screen.getByTestId("NftGridEditable")).toBeInTheDocument();
        expect(screen.getAllByTestId("NftGalleryCardEditable__item--empty")).toHaveLength(15);
        expect(screen.getAllByTestId("NftGalleryCardEditable__delete")).toHaveLength(1);

        await userEvent.click(screen.getByTestId("NftGalleryCardEditable__delete"));

        expect(addNftMock).toHaveBeenCalledTimes(0);
        expect(removeNftMock).toHaveBeenCalledTimes(1);
    });

    it("should open add slider", async () => {
        const addNftMock = vi.fn();
        const removeNftMock = vi.fn();

        render(
            <SliderContext.Provider value={{ isOpen: false, setOpen: addNftMock }}>
                <GalleryContext.Provider
                    value={{
                        nfts: {
                            selected: [nft],
                            add: vi.fn(),
                            update: vi.fn(),
                            remove: removeNftMock,
                        },
                        nftLimit: 16,
                    }}
                >
                    <GalleryNfts
                        nfts={[]}
                        pageMeta={SamplePageMeta.paginated.meta}
                    >
                        <NftGridEditable />
                    </GalleryNfts>
                </GalleryContext.Provider>
            </SliderContext.Provider>,
        );

        expect(screen.getByTestId("NftGridEditable")).toBeInTheDocument();
        expect(screen.getAllByTestId("NftGalleryCardEditable__item--empty")).toHaveLength(15);
        expect(screen.getAllByTestId("NftGalleryCardEditable__add")).toHaveLength(1);

        await userEvent.click(screen.getByTestId("NftGalleryCardEditable__add"));

        expect(addNftMock).toHaveBeenCalledTimes(1);
        expect(removeNftMock).toHaveBeenCalledTimes(0);
    });

    it("should sort", () => {
        const updateSpy = vi.fn();

        render(
            <SliderContext.Provider value={{ isOpen: false, setOpen: vi.fn() }}>
                <GalleryContext.Provider
                    value={{
                        nfts: {
                            selected: [nft],
                            add: vi.fn(),
                            update: updateSpy,
                            remove: vi.fn(),
                        },
                        nftLimit: 16,
                    }}
                >
                    <GalleryNfts
                        nfts={[]}
                        pageMeta={SamplePageMeta.paginated.meta}
                    >
                        <NftGridEditable />
                    </GalleryNfts>
                </GalleryContext.Provider>
            </SliderContext.Provider>,
        );

        expect(screen.getAllByTestId("NftGalleryCardEditable__item--empty")).toHaveLength(15);
        expect(screen.getAllByTestId("NftGalleryCardEditable__add")).toHaveLength(1);

        const draggableElement = screen.getAllByTestId("NftGalleryCardEditable__add")[0];

        fireEvent.drag(draggableElement);
        fireEvent.drop(draggableElement);

        expect(updateSpy).toHaveBeenCalledWith([nft]);
    });
});
