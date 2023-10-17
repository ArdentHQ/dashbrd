/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { type Mock, type SpyInstance } from "vitest";
import { useAuthorizedAction } from "./useAuthorizedAction";
import * as metamaskContextMock from "@/Contexts/MetaMaskContext";
import { mockAuthContext, renderHook } from "@/Tests/testing-library";

let useMetaMaskContextSpy: SpyInstance;
let askForSignature: Mock;
let showConnectOverlay: Mock;
let resetAuthMock: () => void;

describe("useAuthorizedAction signedAction", () => {
    describe("not authenticated", () => {
        beforeEach(() => {
            resetAuthMock = mockAuthContext({});

            showConnectOverlay = vi.fn();

            askForSignature = vi.fn();

            useMetaMaskContextSpy = vi.spyOn(metamaskContextMock, "useMetaMaskContext").mockReturnValue({
                showConnectOverlay,
                askForSignature,
            } as any);
        });

        afterEach(() => {
            useMetaMaskContextSpy.mockRestore();

            resetAuthMock();
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

        it("should ask for signature after connecting", async () => {
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
            resetAuthMock = mockAuthContext({
                authenticated: true,
            });

            showConnectOverlay = vi.fn();

            askForSignature = vi.fn();

            useMetaMaskContextSpy = vi.spyOn(metamaskContextMock, "useMetaMaskContext").mockReturnValue({
                showConnectOverlay,
                askForSignature,
            } as any);
        });

        afterEach(() => {
            resetAuthMock();
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
            resetAuthMock = mockAuthContext({
                authenticated: true,
                signed: true,
            });

            showConnectOverlay = vi.fn();

            askForSignature = vi.fn();

            useMetaMaskContextSpy = vi.spyOn(metamaskContextMock, "useMetaMaskContext").mockReturnValue({
                showConnectOverlay,
                askForSignature,
            } as any);
        });

        afterEach(() => {
            resetAuthMock();
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
            resetAuthMock = mockAuthContext({});

            showConnectOverlay = vi.fn();

            useMetaMaskContextSpy = vi.spyOn(metamaskContextMock, "useMetaMaskContext").mockReturnValue({
                showConnectOverlay,
            } as any);
        });

        afterEach(() => {
            resetAuthMock();
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
            resetAuthMock = mockAuthContext({
                authenticated: true,
            });

            showConnectOverlay = vi.fn();

            useMetaMaskContextSpy = vi.spyOn(metamaskContextMock, "useMetaMaskContext").mockReturnValue({
                showConnectOverlay,
            } as any);
        });

        afterEach(() => {
            resetAuthMock();
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
