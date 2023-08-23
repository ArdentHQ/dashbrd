/* eslint-disable import/export,import/no-namespace */
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
import { ActiveUserContextProvider } from "@/Contexts/ActiveUserContext";
import EnvironmentContextProvider from "@/Contexts/EnvironmentContext";
import { TransactionSliderProvider } from "@/Contexts/TransactionSliderContext";
import { i18n } from "@/I18n";
import UserDataFactory from "@/Tests/Factories/UserDataFactory";
import WalletFactory from "@/Tests/Factories/Wallet/WalletFactory";

export * from "@testing-library/react";

const wallet = new WalletFactory().create();
const user = new UserDataFactory().create();

const queryClient = new QueryClient();

export const render = (component: React.ReactElement, options?: { breakpoint?: Breakpoint }): RenderResult =>
    testRender(
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
                    <ActiveUserContextProvider initialAuth={{ wallet, user, authenticated: false }}>
                        <ResponsiveContext.Provider value={{ width: breakpointWidth(options?.breakpoint) }}>
                            <TransactionSliderProvider>{component}</TransactionSliderProvider>
                        </ResponsiveContext.Provider>
                    </ActiveUserContextProvider>
                </I18nextProvider>
            </EnvironmentContextProvider>
        </QueryClientProvider>,
    );

export const userEvent = testUserEvent;

interface InertiaUseFormProperties extends Partial<Omit<InertiaFormProps<Record<string, unknown>>, "setData">> {
    setData?: (key: string, value: unknown) => void;
}

export const mockInertiaUseForm = (properties: InertiaUseFormProperties): SpyInstance =>
    vi.spyOn(inertia, "useForm").mockReturnValue(properties as InertiaFormProps<Record<string, unknown>>);
