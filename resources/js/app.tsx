/* eslint-disable unicorn/prefer-top-level-await */
/* eslint-disable import/no-relative-parent-imports */
import "./bootstrap";
import "../css/app.css";

import { createInertiaApp } from "@inertiajs/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import axios, { type AxiosError } from "axios";
import axiosCancel from "axios-cancel";
import {
    ArcElement,
    CategoryScale,
    Chart as ChartJS,
    Filler,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    Title,
    Tooltip,
} from "chart.js";
import { resolvePageComponent } from "laravel-vite-plugin/inertia-helpers";
import get from "lodash/get";
import { createRoot } from "react-dom/client";
import { I18nextProvider } from "react-i18next";
import EnvironmentContextProvider from "./Contexts/EnvironmentContext";
import { CookieConsent } from "./cookieConsent";
import { ActiveUserContextProvider } from "@/Contexts/ActiveUserContext";
import MetaMaskContextProvider from "@/Contexts/MetaMaskContext";
import { TransactionSliderProvider } from "@/Contexts/TransactionSliderContext";
import { i18n } from "@/I18n";

// eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
(window as any).CookieConsent = CookieConsent;

// eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
axiosCancel(axios as any);

axios.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const status = get(error, "response.status");

        if (status === 419) {
            await axios.get(route("refresh-csrf-token"));

            if (error.response != null) {
                return await axios(error.response.config);
            }
        }

        return await Promise.reject(error);
    },
);

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Filler, Title);

const appName = window.document.querySelector("title")?.innerText ?? "Dashbrd";

export const queryClient = new QueryClient();

void createInertiaApp({
    title: (title) => (title !== "" ? title : appName),

    resolve: async (name) => await resolvePageComponent(`./Pages/${name}.tsx`, import.meta.glob("./Pages/**/*.tsx")),
    // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <QueryClientProvider client={queryClient}>
                <EnvironmentContextProvider
                    environment={props.initialPage.props.environment}
                    features={props.initialPage.props.features}
                >
                    <I18nextProvider i18n={i18n}>
                        <ActiveUserContextProvider initialAuth={props.initialPage.props.auth}>
                            <MetaMaskContextProvider initialAuth={props.initialPage.props.auth}>
                                <TransactionSliderProvider>
                                    <App {...props} />
                                </TransactionSliderProvider>
                            </MetaMaskContextProvider>
                        </ActiveUserContextProvider>
                    </I18nextProvider>
                </EnvironmentContextProvider>
            </QueryClientProvider>,
        );
    },
    progress: {
        color: "#4B5563",
    },
});
