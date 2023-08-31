import React from "react";
import { TokenLinks } from "./TokenLinks";
import NetworkDataFactory from "@/Tests/Factories/NetworkDataFactory";
import TokenListItemDataFactory from "@/Tests/Factories/Token/TokenListItemDataFactory";
import { render, screen } from "@/Tests/testing-library";

describe("TokenLinks", () => {
    const network = new NetworkDataFactory().create();

    it("renders all links", () => {
        const token = new TokenListItemDataFactory().create({
            website_url: "https://website.example.com",
            discord_url: "https://discord.example.com",
            twitter_url: "https://x.com/test_twitter",
            explorer_url: network.explorerUrl + "/token/0x00",
        });

        render(<TokenLinks token={token} />);

        const website: HTMLAnchorElement = screen.getByTestId("TokenLinks__website");
        expect(website).toBeInTheDocument();
        expect(website.href).toBe("https://website.example.com/");

        const explorer: HTMLAnchorElement = screen.getByTestId("TokenLinks__explorer");
        expect(explorer).toBeInTheDocument();
        expect(explorer.href).toBe(network.explorerUrl + "/token/0x00");

        const discord: HTMLAnchorElement = screen.getByTestId("TokenLinks__discord");
        expect(discord).toBeInTheDocument();
        expect(discord.href).toBe("https://discord.example.com/");

        const twitter: HTMLAnchorElement = screen.getByTestId("TokenLinks__twitter");
        expect(twitter).toBeInTheDocument();
        expect(twitter.href).toBe("https://x.com/test_twitter");
    });

    it("does not render website if not specified", () => {
        const token = new TokenListItemDataFactory().create({
            website_url: null,
            discord_url: "https://discord.example.com",
            twitter_url: "https://x.com/test_twitter",
            explorer_url: network.explorerUrl + "/token/0x00",
        });

        render(<TokenLinks token={token} />);

        expect(screen.queryByTestId("TokenLinks__website")).not.toBeInTheDocument();

        expect(screen.getByTestId("TokenLinks__explorer")).toBeInTheDocument();
        expect(screen.getByTestId("TokenLinks__discord")).toBeInTheDocument();
        expect(screen.getByTestId("TokenLinks__twitter")).toBeInTheDocument();
    });

    it("does not render twitter if not specified", () => {
        const token = new TokenListItemDataFactory().create({
            website_url: "https://website.example.com",
            discord_url: "https://discord.example.com",
            twitter_url: null,
            explorer_url: network.explorerUrl + "/token/0x00",
        });

        render(<TokenLinks token={token} />);

        expect(screen.queryByTestId("TokenLinks__twitter")).not.toBeInTheDocument();

        expect(screen.getByTestId("TokenLinks__explorer")).toBeInTheDocument();
        expect(screen.getByTestId("TokenLinks__discord")).toBeInTheDocument();
        expect(screen.getByTestId("TokenLinks__website")).toBeInTheDocument();
    });

    it("does not render discord if not specified", () => {
        const token = new TokenListItemDataFactory().create({
            website_url: "https://website.example.com",
            discord_url: null,
            twitter_url: "https://x.com/test_twitter",
            explorer_url: network.explorerUrl + "/token/0x00",
        });

        render(<TokenLinks token={token} />);

        expect(screen.queryByTestId("TokenLinks__discord")).not.toBeInTheDocument();

        expect(screen.getByTestId("TokenLinks__explorer")).toBeInTheDocument();
        expect(screen.getByTestId("TokenLinks__twitter")).toBeInTheDocument();
        expect(screen.getByTestId("TokenLinks__website")).toBeInTheDocument();
    });
});
