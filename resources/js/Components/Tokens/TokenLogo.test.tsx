import React from "react";
import { TokenLogo } from "@/Components/Tokens/TokenLogo";
import TokenListItemDataFactory from "@/Tests/Factories/Token/TokenListItemDataFactory";
import { render, screen } from "@/Tests/testing-library";

describe("TokenLogo", () => {
    it("should render image", () => {
        const token = new TokenListItemDataFactory().create({
            name: "BRDY TOKEN",
            logo_url: "https://example.com/logo.png",
        });

        render(
            <TokenLogo
                data-testid="TokenLogo"
                tokenName={token.name}
                imgSource={token.logo_url}
            />,
        );

        expect(screen.getByTestId("TokenLogo")).toBeInTheDocument();

        const image = screen.getByTestId("TokenLogo").querySelector("img");

        expect(image).toHaveAttribute("src", `https://example.com/logo.png`);

        expect(image).toHaveAttribute("alt", "BT");
    });

    it("should render with placeholder", () => {
        render(
            <TokenLogo
                data-testid="TokenLogo"
                tokenName={"BRDY TOKEN"}
                imgSource={null}
            />,
        );

        expect(screen.getByTestId("TokenLogo")).toBeInTheDocument();

        const image = screen.getByTestId("TokenLogo").querySelector("img");

        expect(image).not.toBeInTheDocument();

        expect(screen.getByTestId("TokenLogo")).toHaveTextContent("BT");
    });

    it("should render with chain icon", () => {
        render(
            <TokenLogo
                data-testid="TokenLogo"
                chainId={1}
                tokenName={"BRDY TOKEN"}
                imgSource={null}
            />,
        );

        expect(screen.getByTestId("TokenLogo__chain")).toBeInTheDocument();
    });

    it("should have isSelected property set to false by default", () => {
        render(
            <TokenLogo
                data-testid="TokenLogo"
                chainId={1}
                tokenName={"BRDY TOKEN"}
                imgSource={null}
            />,
        );

        expect(screen.getByTestId("TokenLogo__chain")).toHaveClass("border-white");
    });

    it("should render different styles when isSelected is true", () => {
        render(
            <TokenLogo
                data-testid="TokenLogo"
                chainId={1}
                tokenName={"BRDY TOKEN"}
                imgSource={null}
                isSelected={true}
            />,
        );

        expect(screen.getByTestId("TokenLogo__chain")).toHaveClass("border-theme-hint-100");
    });

    it("should have size md by default", () => {
        render(
            <TokenLogo
                data-testid="TokenLogo"
                chainId={1}
                tokenName="BRDY TOKEN"
                imgSource={null}
            />,
        );

        expect(screen.getByTestId("TokenLogo__chain")).toHaveClass("border-4 -m-3");
    });

    it("should render different styles in case of sm size", () => {
        render(
            <TokenLogo
                data-testid="TokenLogo"
                chainId={1}
                tokenName="BRDY TOKEN"
                imgSource={null}
                networkIconSize="sm"
            />,
        );

        expect(screen.getByTestId("TokenLogo__chain")).toHaveClass("border-3 -m-1.5");
    });
});
