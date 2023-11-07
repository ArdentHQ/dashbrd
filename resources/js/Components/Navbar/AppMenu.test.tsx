import React from "react";
import { afterAll } from "vitest";
import { AppMenu } from "./AppMenu";
import * as environmentContextMock from "@/Contexts/EnvironmentContext";
import UserDataFactory from "@/Tests/Factories/UserDataFactory";
import WalletFactory from "@/Tests/Factories/Wallet/WalletFactory";
import { mockAuthContext, render, screen } from "@/Tests/testing-library";

const environmentDefault = {
    environment: "local",
    isLocal: true,
    features: {
        collections: true,
        galleries: true,
        portfolio: true,
        articles: true,
    },
};

let resetAuthContextMock: () => void;

describe("AppMenu", () => {
    beforeAll(() => {
        resetAuthContextMock = mockAuthContext({
            user: new UserDataFactory().create(),
            wallet: new WalletFactory().create(),
        });
    });

    afterAll(() => {
        resetAuthContextMock();
    });

    it("should render with 3 enabled items", () => {
        const environmentSpy = vi
            .spyOn(environmentContextMock, "useEnvironmentContext")
            .mockReturnValue(environmentDefault);

        render(<AppMenu />);

        expect(screen.getAllByTestId("AppMenuItem")).toHaveLength(3);

        environmentSpy.mockRestore();
    });

    it("should render without gallery item if not enabled", () => {
        const environmentSpy = vi.spyOn(environmentContextMock, "useEnvironmentContext").mockReturnValue({
            ...environmentDefault,
            features: {
                ...environmentDefault.features,
                galleries: false,
            },
        });

        render(<AppMenu />);

        expect(screen.queryByText(/Galleries/i)).not.toBeInTheDocument();

        environmentSpy.mockRestore();
    });

    it("should render without collections item if not enabled", () => {
        const environmentSpy = vi.spyOn(environmentContextMock, "useEnvironmentContext").mockReturnValue({
            ...environmentDefault,
            features: {
                ...environmentDefault.features,
                collections: false,
            },
        });

        render(<AppMenu />);

        expect(screen.queryByText(/Collections/i)).not.toBeInTheDocument();

        environmentSpy.mockRestore();
    });

    it("should render without portfolio item if not enabled", () => {
        const environmentSpy = vi.spyOn(environmentContextMock, "useEnvironmentContext").mockReturnValue({
            ...environmentDefault,
            features: {
                ...environmentDefault.features,
                portfolio: false,
            },
        });

        render(<AppMenu />);

        expect(screen.queryByText(/Wallet/i)).not.toBeInTheDocument();

        environmentSpy.mockRestore();
    });

    it("should render empty if nothing enabled", () => {
        const environmentSpy = vi.spyOn(environmentContextMock, "useEnvironmentContext").mockReturnValue({
            ...environmentDefault,
            features: {
                portfolio: false,
                galleries: false,
                collections: false,
                articles: false,
            },
        });

        render(<AppMenu />);

        expect(screen.queryByTestId("AppMenu__trigger")).not.toBeInTheDocument();

        environmentSpy.mockRestore();
    });
});
