import React from "react";
import { afterAll, type SpyInstance } from "vitest";
import { AppMenu } from "./AppMenu";
import * as activeUserContextMock from "@/Contexts/ActiveUserContext";
import * as environmentContextMock from "@/Contexts/EnvironmentContext";
import UserDataFactory from "@/Tests/Factories/UserDataFactory";
import WalletFactory from "@/Tests/Factories/Wallet/WalletFactory";
import { render, screen } from "@/Tests/testing-library";

const environmentDefault = {
    environment: "local",
    isLocal: true,
    features: {
        collections: true,
        galleries: true,
        portfolio: true,
    },
};

const activeUserContext = {
    user: new UserDataFactory().create(),
    wallet: new WalletFactory().create(),
    authenticated: true,
};

let activeUserSpy: SpyInstance;

describe("AppMenu", () => {
    beforeAll(() => {
        activeUserSpy = vi.spyOn(activeUserContextMock, "useActiveUser").mockReturnValue(activeUserContext);
    });

    afterAll(() => {
        activeUserSpy.mockRestore();
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

        expect(screen.getAllByTestId("AppMenuItem")).toHaveLength(2);

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

        expect(screen.getAllByTestId("AppMenuItem")).toHaveLength(2);

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

        expect(screen.getAllByTestId("AppMenuItem")).toHaveLength(2);

        environmentSpy.mockRestore();
    });

    it("should render empty if nothing enabled", () => {
        const environmentSpy = vi.spyOn(environmentContextMock, "useEnvironmentContext").mockReturnValue({
            ...environmentDefault,
            features: {
                portfolio: false,
                galleries: false,
                collections: false,
            },
        });

        render(<AppMenu />);

        expect(screen.queryByTestId("AppMenu__trigger")).not.toBeInTheDocument();

        environmentSpy.mockRestore();
    });
});
