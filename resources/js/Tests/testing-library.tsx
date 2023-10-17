/* eslint-disable import/export,import/no-namespace, @typescript-eslint/ban-ts-comment */

import * as inertia from "@inertiajs/react";
import { type InertiaFormProps } from "@inertiajs/react/types/useForm";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type RenderResult, render as testRender } from "@testing-library/react";
import testUserEvent from "@testing-library/user-event";
import React from "react";
import { I18nextProvider } from "react-i18next";
import { Context as ResponsiveContext } from "react-responsive";
import { type SpyInstance } from "vitest";
import { type Breakpoint, breakpointWidth } from "./utils";
import { AuthContextProvider } from "@/Contexts/AuthContext";
import * as ActiveUserContextMock from "@/Contexts/AuthContext";
import EnvironmentContextProvider from "@/Contexts/EnvironmentContext";
import { i18n } from "@/I18n";
import UserDataFactory from "@/Tests/Factories/UserDataFactory";
import WalletFactory from "@/Tests/Factories/Wallet/WalletFactory";
export * from "@testing-library/react";

const wallet = new WalletFactory().create();
const user = new UserDataFactory().create();

const queryClient = new QueryClient();

export const TestProviders = ({
    children,
    options,
}: {
    children: React.ReactElement;
    options?: { breakpoint?: Breakpoint };
}): JSX.Element => (
    <QueryClientProvider client={queryClient}>
        <EnvironmentContextProvider
            environment="local"
            features={{
                collections: true,
                galleries: true,
                portfolio: true,
            }}
        >
            <I18nextProvider i18n={i18n}>
                <AuthContextProvider initialAuth={{ wallet, user, authenticated: false, signed: false }}>
                    <ResponsiveContext.Provider value={{ width: breakpointWidth(options?.breakpoint) }}>
                        {children}
                    </ResponsiveContext.Provider>
                </AuthContextProvider>
            </I18nextProvider>
        </EnvironmentContextProvider>
    </QueryClientProvider>
);

export const render = (component: React.ReactElement, options?: { breakpoint?: Breakpoint }): RenderResult =>
    testRender(<TestProviders options={options}>{component}</TestProviders>);

export const userEvent = testUserEvent;

interface InertiaUseFormProperties extends Partial<Omit<InertiaFormProps<Record<string, unknown>>, "setData">> {
    setData?: (key: string, value: unknown) => void;
}

export const mockInertiaUseForm = (properties: InertiaUseFormProperties): SpyInstance =>
    // TODO(@goga-m)[2023-10-31]: Remove ts-ignore and construct an object that matches the return type.
    // @ts-ignore
    vi.spyOn(inertia, "useForm").mockReturnValue(properties as InertiaFormProps<Record<string, unknown>>);

export const mockAuthContext = (properties: Partial<App.Data.AuthData>): (() => void) => {
    const useAuthSpy = vi.spyOn(ActiveUserContextMock, "useAuth").mockReturnValue({
        user: null,
        wallet: null,
        authenticated: properties.user != null && properties.wallet != null,
        signed: false,
        logout: vi.fn(),
        setAuthData: vi.fn(),
        ...properties,
    });

    return () => {
        useAuthSpy.mockRestore();
    };
};
