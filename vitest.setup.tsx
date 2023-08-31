import { createElement, forwardRef } from "react";
import "@testing-library/jest-dom";
import MockDate from "mockdate";
import { i18n } from "@/I18n";
import { BASE_URL, server } from "@/Tests/Mocks/server";
import { isTruthy } from "@/Utils/is-truthy";
import { DefaultBodyType, MockedRequest } from "msw";
import * as reactInViewport from "react-in-viewport";

/////////
// Mocks
/////////
vi.mock("react-hot-toast", async () => {
    const actual = await vi.importActual<Record<string, unknown>>("react-hot-toast");

    return {
        ...actual,
        Toaster: vi.fn(),
    };
});

vi.mock("@inertiajs/react", async () => {
    const actual = await vi.importActual<Record<string, unknown>>("@inertiajs/react");

    return {
        ...actual,
        usePage: () => ({
            props: {
                auth: {
                    user: {},
                    wallet: {
                        address: "0x8ba1f109551bd432803012645ac136ddd64dba72",
                    },
                },
                toast: <div></div>,
                reportReasons: {
                    first: "First reason",
                    second: "Second reason",
                    third: "Third reason",
                },
            },
        }),
    };
});

vi.mock("react-chartjs-2", async () => {
    const actual = await vi.importActual<Record<string, unknown>>("react-chartjs-2");

    return {
        ...actual,
        Line: forwardRef(({ data, options, ...properties }: any, ref: any) => {
            ref.current = {
                ctx: {
                    createLinearGradient: vi.fn().mockReturnValue({
                        addColorStop: vi.fn(),
                    }),
                },
                update: vi.fn(),
                options: {},
                data: {
                    datasets: [
                        {
                            data: [],
                        },
                    ],
                },
            };

            return createElement(
                "canvas",
                { ...properties },
                JSON.stringify({
                    data,
                    options,
                }),
            );
        }),
    };
});

Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});

class ResizeObserverMock {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
}

window.ResizeObserver = ResizeObserverMock;

//////////
// Setups
//////////
const setupCopyToClipboardMock = () => {
    Object.assign(window.navigator, {
        clipboard: {
            writeText: (text: string) => text,
        },
    });
};

const setupWindowOpen = () => {
    vi.spyOn(window, "open").mockImplementation(() => null);
};

const setupRoute = () => {
    vi.stubGlobal("route", (path: string) => {
        if (!isTruthy(path)) {
            return {
                current: (url?: string) => `${BASE_URL}/${url?.replace(".", "/")}`,
            };
        }

        return `${BASE_URL}/${path.replace(".", "/")}`;
    });
};

// Needed by Headless UI.
const setupInterSectionObserver = () => {
    const IntersectionObserverMock = vi.fn(() => ({
        disconnect: vi.fn(),
        observe: vi.fn(),
        takeRecords: vi.fn(),
        unobserve: vi.fn(),
    }));

    vi.stubGlobal("IntersectionObserver", IntersectionObserverMock);
};

// Used  in `Image.tsx` to mock lazy-loading of images.
export const mockViewportVisibilitySensor = (properties?: { inViewport?: boolean; onEnterViewport?: () => void }) => {
    //@ts-ignore
    vi.spyOn(reactInViewport, "useInViewport").mockImplementation((element, _, __, options) => {
        if (isTruthy(properties?.inViewport)) {
            options?.onEnterViewport?.();
        }

        return {
            inViewport: properties?.inViewport ?? true,
        };
    });
};

/**
 * Unmocked requests in MSW do not force test to fail and stop, although it's expected.
 * This workaround groups all the unhandled requests outside of the listener's scope
 * and throws exception with the list of all unhandled requests forcing the tests to fail.
 *
 * See more: https://github.com/mswjs/msw/issues/946
 */
const unhandledRequests: Array<MockedRequest<DefaultBodyType>> = [];
beforeAll(() => {
    server.listen({
        onUnhandledRequest: (request) => {
            unhandledRequests.push(request);
            return request;
        },
    });
});

beforeEach(() => {
    setupCopyToClipboardMock();
    setupWindowOpen();
    setupInterSectionObserver();
    setupRoute();
    mockViewportVisibilitySensor();

    // Ensure the same locale is used on all machines.
    const { DateTimeFormat } = Intl;
    vi.spyOn(Intl, "DateTimeFormat").mockImplementation(
        (_?: string | string[], options?: Intl.DateTimeFormatOptions) => new DateTimeFormat("en-US", options),
    );

    i18n.init();

    MockDate.set(new Date("2023-03-01T00:00:00.000Z"));
});

afterEach(() => {
    server.resetHandlers();

    MockDate.reset();
});

afterAll(() => {
    server.close();

    // Run garbage collector after each test file.
    if (global.gc) {
        global.gc();
    }

    // Throw any unhandled requests to force the test to stop.
    if (unhandledRequests.length > 0) {
        const urls = unhandledRequests.map((request, index) => `${request.method} ${request.url}`).join("\n");
        throw new Error(`[MSW] Error: captured a request without a matching request handler:\n${urls}\n`);
    }
});

window.IS_REACT_ACT_ENVIRONMENT = true;
