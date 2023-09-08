import React from "react";
import { GalleryCurator } from "@/Components/Galleries/GalleryPage/GalleryCurator";
import WalletFactory from "@/Tests/Factories/Wallet/WalletFactory";
import { render, screen } from "@/Tests/testing-library";
import { formatAddress } from "@/Utils/format-address";

describe("GalleryCurator", () => {
    it("should render", () => {
        const wallet = new WalletFactory().withoutDomain().create({
            address: "0x1234567890123456789012345678901234567890",
        });

        render(<GalleryCurator wallet={wallet} />);

        expect(screen.getByTestId("ButtonLink--anchor")).toBeInTheDocument();

        expect(screen.getByText("0x123…67890")).toBeTruthy();

        expect(screen.getByTestId("ButtonLink--anchor").getAttribute("href")).toEqual(
            `https://etherscan.io/address/${formatAddress(wallet.address)}`,
        );
    });

    it("should render with wallet domain", () => {
        const wallet = new WalletFactory().create({
            domain: "alfonsobries.eth",
        });

        render(<GalleryCurator wallet={wallet} />);

        expect(screen.getByTestId("GalleryCurator")).toBeInTheDocument();

        expect(screen.queryByText("0x123…67890")).toBeFalsy();

        expect(screen.getByText("alfonsobries.eth")).toBeTruthy();
    });

    it("can disable truncation for an address", () => {
        const wallet = new WalletFactory().withoutDomain().create({
            address: "0x1234567890123456789012345678901234567890",
        });

        render(
            <GalleryCurator
                wallet={wallet}
                truncate={false}
            />,
        );

        expect(screen.getByTestId("GalleryCurator")).toBeInTheDocument();

        expect(screen.getByText("0x1234567890123456789012345678901234567890")).toBeTruthy();
    });

    it("can render a wallet domain even without truncaation", () => {
        const wallet = new WalletFactory().create({
            domain: "hello.world",
        });

        render(
            <GalleryCurator
                wallet={wallet}
                truncate={false}
            />,
        );

        expect(screen.getByTestId("GalleryCurator")).toBeInTheDocument();

        expect(screen.getByText("hello.world")).toBeTruthy();
    });

    it("can truncate an address after a certain number of characters", () => {
        const wallet = new WalletFactory().withoutDomain().create({
            address: "0x1234567890123456789012345678901234567890",
        });

        render(
            <GalleryCurator
                wallet={wallet}
                truncate={7}
            />,
        );

        expect(screen.getByTestId("GalleryCurator")).toBeInTheDocument();

        expect(screen.getByText("0x1…890")).toBeTruthy();
    });
});
