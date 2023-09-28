import { useMetaMaskContext } from "@/Contexts/MetaMaskContext";
import { useAuth } from "@/Hooks/useAuth";

export const useAuthorizedAction = (): {
    signedAction: (action: ({ authenticated, signed }: { authenticated: boolean; signed: boolean }) => void) => void;
    authenticatedAction: (action: ({ authenticated }: { authenticated: boolean }) => void) => void;
} => {
    const { authenticated } = useAuth();
    const { showConnectOverlay, signed, askForSignature } = useMetaMaskContext();

    const signedAction = (
        action: ({ authenticated, signed }: { authenticated: boolean; signed: boolean }) => void,
    ): void => {
        const onAction = (): void => {
            action({ authenticated, signed });
        };

        if (!authenticated) {
            const onConnected = (): void => {
                askForSignature(onAction);
            };

            showConnectOverlay(onConnected);

            return;
        }

        if (!signed) {
            askForSignature(onAction);

            return;
        }

        action({ authenticated, signed });
    };

    const authenticatedAction = (action: ({ authenticated }: { authenticated: boolean }) => void): void => {
        const onAction = (): void => {
            action({ authenticated });
        };

        if (!authenticated) {
            showConnectOverlay(onAction);

            return;
        }

        action({ authenticated });
    };

    return { signedAction, authenticatedAction };
};
