/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import axios from "axios";
import { type Mock, type SpyInstance } from "vitest";
import { useAuthorizedAction } from "./useAuthorizedAction";
import * as metamaskContextMock from "@/Contexts/MetaMaskContext";
import { renderHook } from "@/Tests/testing-library";

let axiosSpy: SpyInstance;
let useMetaMaskContextSpy: SpyInstance;
let askForSignature: Mock;
let showConnectOverlay: Mock;

describe("useAuthorizedAction signedAction", () => {
    describe("not authenticated", () => {
        beforeEach(() => {
            axiosSpy = vi.spyOn(axios, "get").mockResolvedValue({
                data: {
                    authenticated: false,
                    signed: false,
                },
            } as any);

            showConnectOverlay = vi.fn();

            askForSignature = vi.fn();

            useMetaMaskContextSpy = vi.spyOn(metamaskContextMock, "useMetaMaskContext").mockReturnValue({
                signed: false,
                showConnectOverlay,
                askForSignature,
            } as any);
        });

        afterEach(() => {
            axiosSpy.mockRestore();
            useMetaMaskContextSpy.mockRestore();
        });

        it("should show connect overlay if not authenticated", async () => {
            const { signedAction } = renderHook(() => useAuthorizedAction()).result.current;

            const action = vi.fn();

            await signedAction(() => {
                action();
            });

            expect(showConnectOverlay).toHaveBeenCalled();
            expect(action).not.toHaveBeenCalled();
            expect(askForSignature).not.toHaveBeenCalled();
        });

        it("should ask for signature  after connecting", async () => {
            showConnectOverlay.mockImplementation((onConnected) => {
                onConnected();
            });

            const { signedAction } = renderHook(() => useAuthorizedAction()).result.current;

            const action = vi.fn();

            await signedAction(() => {
                action();
            });

            expect(showConnectOverlay).toHaveBeenCalled();
            expect(askForSignature).toHaveBeenCalled();
            expect(action).not.toHaveBeenCalled();
        });

        it("should run the action after signed", async () => {
            showConnectOverlay.mockImplementation((onConnected) => {
                onConnected();
            });
            askForSignature.mockImplementation((onSigned) => {
                onSigned();
            });

            const { signedAction } = renderHook(() => useAuthorizedAction()).result.current;

            const action = vi.fn();

            await signedAction(() => {
                action();
            });

            expect(showConnectOverlay).toHaveBeenCalled();
            expect(askForSignature).toHaveBeenCalled();
            expect(action).toHaveBeenCalled();
        });
    });

    describe("authenticated but not signed", () => {
        beforeEach(() => {
            axiosSpy = vi.spyOn(axios, "get").mockResolvedValue({
                data: {
                    authenticated: true,
                    signed: false,
                },
            } as any);

            showConnectOverlay = vi.fn();

            askForSignature = vi.fn();

            useMetaMaskContextSpy = vi.spyOn(metamaskContextMock, "useMetaMaskContext").mockReturnValue({
                signed: false,
                showConnectOverlay,
                askForSignature,
            } as any);
        });

        afterEach(() => {
            axiosSpy.mockRestore();
            useMetaMaskContextSpy.mockRestore();
        });

        it("should ask for signature", async () => {
            const { signedAction } = renderHook(() => useAuthorizedAction()).result.current;

            const action = vi.fn();

            await signedAction(() => {
                action();
            });

            expect(showConnectOverlay).not.toHaveBeenCalled();
            expect(askForSignature).toHaveBeenCalled();
            expect(action).not.toHaveBeenCalled();
        });

        it("should run the action after signed", async () => {
            askForSignature.mockImplementation((onSigned) => {
                onSigned();
            });

            const { signedAction } = renderHook(() => useAuthorizedAction()).result.current;

            const action = vi.fn();

            await signedAction(() => {
                action();
            });

            expect(showConnectOverlay).not.toHaveBeenCalled();
            expect(askForSignature).toHaveBeenCalled();
            expect(action).toHaveBeenCalled();
        });
    });

    describe("authenticated and signed", () => {
        beforeEach(() => {
            axiosSpy = vi.spyOn(axios, "get").mockResolvedValue({
                data: {
                    authenticated: true,
                    signed: true,
                },
            } as any);

            showConnectOverlay = vi.fn();

            askForSignature = vi.fn();

            useMetaMaskContextSpy = vi.spyOn(metamaskContextMock, "useMetaMaskContext").mockReturnValue({
                signed: true,
                showConnectOverlay,
                askForSignature,
            } as any);
        });

        afterEach(() => {
            axiosSpy.mockRestore();
            useMetaMaskContextSpy.mockRestore();
        });

        it("should run the action", async () => {
            const { signedAction } = renderHook(() => useAuthorizedAction()).result.current;

            const action = vi.fn();

            await signedAction(() => {
                action();
            });

            expect(showConnectOverlay).not.toHaveBeenCalled();
            expect(askForSignature).not.toHaveBeenCalled();
            expect(action).toHaveBeenCalled();
        });
    });
});

describe("useAuthorizedAction authenticatedAction", () => {
    describe("not authenticated", () => {
        beforeEach(() => {
            axiosSpy = vi.spyOn(axios, "get").mockResolvedValue({
                data: {
                    authenticated: false,
                    signed: false,
                },
            } as any);

            showConnectOverlay = vi.fn();

            useMetaMaskContextSpy = vi.spyOn(metamaskContextMock, "useMetaMaskContext").mockReturnValue({
                signed: false,
                showConnectOverlay,
            } as any);
        });

        afterEach(() => {
            axiosSpy.mockRestore();
            useMetaMaskContextSpy.mockRestore();
        });

        it("should show connect overlay if not authenticated", async () => {
            const { authenticatedAction } = renderHook(() => useAuthorizedAction()).result.current;

            const action = vi.fn();

            await authenticatedAction(() => {
                action();
            });

            expect(showConnectOverlay).toHaveBeenCalled();
            expect(action).not.toHaveBeenCalled();
        });

        it("should run the action after connected", async () => {
            showConnectOverlay.mockImplementation((onConnected) => {
                onConnected();
            });

            const { authenticatedAction } = renderHook(() => useAuthorizedAction()).result.current;

            const action = vi.fn();

            await authenticatedAction(() => {
                action();
            });

            expect(showConnectOverlay).toHaveBeenCalled();
            expect(action).toHaveBeenCalled();
        });
    });

    describe("authenticated", () => {
        beforeEach(() => {
            axiosSpy = vi.spyOn(axios, "get").mockResolvedValue({
                data: {
                    authenticated: true,
                    signed: false,
                },
            } as any);

            showConnectOverlay = vi.fn();

            useMetaMaskContextSpy = vi.spyOn(metamaskContextMock, "useMetaMaskContext").mockReturnValue({
                showConnectOverlay,
            } as any);
        });

        afterEach(() => {
            axiosSpy.mockRestore();
            useMetaMaskContextSpy.mockRestore();
        });

        it("should run the action", async () => {
            const { authenticatedAction } = renderHook(() => useAuthorizedAction()).result.current;

            const action = vi.fn();

            await authenticatedAction(() => {
                action();
            });

            expect(showConnectOverlay).not.toHaveBeenCalled();
            expect(action).toHaveBeenCalled();
        });
    });
});
