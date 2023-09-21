/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { type Mock, type SpyInstance } from "vitest";
import { useAuthorizedAction } from "./useAuthorizedAction";
import * as metamaskContextMock from "@/Contexts/MetaMaskContext";
import * as useAuthMock from "@/Hooks/useAuth";
import { renderHook } from "@/Tests/testing-library";

let useAuthSpy: SpyInstance;
let useMetaMaskContextSpy: SpyInstance;
let askForSignature: Mock;
let showConnectOverlay: Mock;

describe("useAuthorizedAction", () => {
    describe("not authenticated", () => {
        beforeEach(() => {
            useAuthSpy = vi.spyOn(useAuthMock, "useAuth").mockReturnValue({
                authenticated: false,
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
            useAuthSpy.mockRestore();
            useMetaMaskContextSpy.mockRestore();
        });

        it("should show connect overlay if not authenticated", () => {
            const { signedAction } = renderHook(() => useAuthorizedAction()).result.current;

            const action = vi.fn();

            signedAction(() => {
                action();
            });

            expect(showConnectOverlay).toHaveBeenCalled();
            expect(action).not.toHaveBeenCalled();
            expect(askForSignature).not.toHaveBeenCalled();
        });

        it("should ask for signature  after connecting", () => {
            showConnectOverlay.mockImplementation((onConnected) => {
                onConnected();
            });

            const { signedAction } = renderHook(() => useAuthorizedAction()).result.current;

            const action = vi.fn();

            signedAction(() => {
                action();
            });

            expect(showConnectOverlay).toHaveBeenCalled();
            expect(askForSignature).toHaveBeenCalled();
            expect(action).not.toHaveBeenCalled();
        });

        it("should run the action after signed", () => {
            showConnectOverlay.mockImplementation((onConnected) => {
                onConnected();
            });
            askForSignature.mockImplementation((onSigned) => {
                onSigned();
            });

            const { signedAction } = renderHook(() => useAuthorizedAction()).result.current;

            const action = vi.fn();

            signedAction(() => {
                action();
            });

            expect(showConnectOverlay).toHaveBeenCalled();
            expect(askForSignature).toHaveBeenCalled();
            expect(action).toHaveBeenCalled();
        });
    });

    describe("authenticated but not signed", () => {
        beforeEach(() => {
            useAuthSpy = vi.spyOn(useAuthMock, "useAuth").mockReturnValue({
                authenticated: true,
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
            useAuthSpy.mockRestore();
            useMetaMaskContextSpy.mockRestore();
        });

        it("should ask for signature", () => {
            const { signedAction } = renderHook(() => useAuthorizedAction()).result.current;

            const action = vi.fn();

            signedAction(() => {
                action();
            });

            expect(showConnectOverlay).not.toHaveBeenCalled();
            expect(askForSignature).toHaveBeenCalled();
            expect(action).not.toHaveBeenCalled();
        });

        it("should run the action after signed", () => {
            askForSignature.mockImplementation((onSigned) => {
                onSigned();
            });

            const { signedAction } = renderHook(() => useAuthorizedAction()).result.current;

            const action = vi.fn();

            signedAction(() => {
                action();
            });

            expect(showConnectOverlay).not.toHaveBeenCalled();
            expect(askForSignature).toHaveBeenCalled();
            expect(action).toHaveBeenCalled();
        });
    });

    describe("authenticated and signed", () => {
        beforeEach(() => {
            useAuthSpy = vi.spyOn(useAuthMock, "useAuth").mockReturnValue({
                authenticated: true,
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
            useAuthSpy.mockRestore();
            useMetaMaskContextSpy.mockRestore();
        });

        it("should run the action", () => {
            const { signedAction } = renderHook(() => useAuthorizedAction()).result.current;

            const action = vi.fn();

            signedAction(() => {
                action();
            });

            expect(showConnectOverlay).not.toHaveBeenCalled();
            expect(askForSignature).not.toHaveBeenCalled();
            expect(action).toHaveBeenCalled();
        });
    });
});
