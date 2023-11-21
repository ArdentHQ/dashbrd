import React from "react";
import { EditableGalleryHook } from "@/Components/Galleries/Hooks/useEditableGalleryContext";
import { GalleryNfts } from "@/Components/Galleries/Hooks/useGalleryNftsContext";
import { NftSelectionHook } from "@/Components/Galleries/Hooks/useNftSelectableContext";
import { NftCollectionSlider } from "@/Components/Galleries/NftCollection/NftCollectionSlider";
import { LayoutWrapper } from "@/Components/Layout/LayoutWrapper";
import * as NavbarMock from "@/Components/Layout/Navbar";
import { useSliderContext } from "@/Components/Slider";
import * as useDarkModeContext from "@/Contexts/DarkModeContext";
import { BASE_URL, requestMock, server } from "@/Tests/Mocks/server";
import { SamplePageMeta } from "@/Tests/SampleData";
import { mockAuthContext, render, screen, userEvent } from "@/Tests/testing-library";
import { Breakpoint } from "@/Tests/utils";
vi.mock("@/Hooks/useAuth", () => ({
    useAuth: () => ({
        user: null,
        signedWallet: null,
        authenticated: null,
        showAuthOverlay: true,
    }),
}));

vi.mock("@/Contexts/MetaMaskContext", () => ({
    useMetaMaskContext: () => ({
        needsMetaMask: false,
        connectWallet: vi.fn(),
        initialized: false,
        connecting: false,
        switching: false,
        errorMessage: undefined,
        waitingSignature: false,
        requiresSignature: false,
    }),
}));

describe("LayoutWrapper", () => {
    beforeAll(() => {
        vi.spyOn(useDarkModeContext, "useDarkModeContext").mockReturnValue({ isDark: false, toggleDarkMode: vi.fn() });
    });

    afterAll(() => {
        vi.restoreAllMocks();
    });

    it("should render", () => {
        render(
            <LayoutWrapper>
                <div data-testid="test" />
            </LayoutWrapper>,
        );

        expect(screen.getByTestId("test")).toBeInTheDocument();
        expect(screen.getByTestId("LayoutWrapper")).toBeInTheDocument();
    });

    it("handles logout", async () => {
        const logoutMock = vi.fn();

        vi.spyOn(NavbarMock, "Navbar").mockImplementation((properties) => (
            <button
                data-testid="Logout"
                onClick={properties.onLogout}
            ></button>
        ));

        mockAuthContext({
            authenticated: true,
            logout: logoutMock,
        });

        render(
            <LayoutWrapper>
                <div data-testid="test" />
            </LayoutWrapper>,
            {
                breakpoint: Breakpoint.lg,
            },
        );

        await userEvent.click(screen.getByTestId("Logout"));

        expect(logoutMock).toHaveBeenCalled();
    });

    it("should render with slider", async () => {
        server.use(
            requestMock(BASE_URL, {
                nfts: [],
                collections: {
                    paginated: {
                        data: [],
                        ...SamplePageMeta.paginated,
                    },
                },
            }),
            requestMock(`${BASE_URL}/my-galleries/collections`, {
                nfts: [],
                collections: {
                    paginated: {
                        data: [],
                        ...SamplePageMeta.paginated,
                    },
                },
            }),
        );

        const TestButton = (): JSX.Element => {
            const { setOpen } = useSliderContext();

            return (
                <div
                    data-testid="TestButton"
                    onClick={() => {
                        setOpen(true);
                    }}
                />
            );
        };

        render(
            <LayoutWrapper withSlider>
                <EditableGalleryHook nftLimit={16}>
                    <GalleryNfts>
                        <NftSelectionHook>
                            <NftCollectionSlider hiddenCollectionsCount={0} />
                        </NftSelectionHook>
                    </GalleryNfts>
                </EditableGalleryHook>

                <TestButton />
            </LayoutWrapper>,
        );

        expect(screen.getByTestId("TestButton")).toBeInTheDocument();
        expect(screen.getByTestId("LayoutWrapper")).toBeInTheDocument();
        expect(screen.queryByTestId("NftCollectionSlider")).not.toBeInTheDocument();

        await userEvent.click(screen.getByTestId("TestButton"));

        expect(screen.queryByTestId("NftCollectionSlider")).toBeInTheDocument();
    });
});
