import { useMetaMaskContext } from "@/Contexts/MetaMaskContext";
import { useAuth } from "@/Hooks/useAuth";

export const useAuthorizedAction = (): {
    signedAction: (
        action: ({ authenticated, signed }: { authenticated: boolean; signed: boolean }) => Promise<void>,
    ) => Promise<void>;
    authenticatedAction: (action: ({ authenticated }: { authenticated: boolean }) => Promise<void>) => Promise<void>;
} => {
    const { authenticated } = useAuth();
    const { showConnectOverlay, signed, askForSignature } = useMetaMaskContext();

    const authenticatedAction = async (
        action: ({ authenticated }: { authenticated: boolean }) => Promise<void>,
    ): Promise<void> => {
        const onAction = async (): Promise<void> => {
            await action({ authenticated });
        };

        if (!authenticated) {
            await showConnectOverlay(onAction);

            return;
        }

        await action({ authenticated });
    };

    const signedAction = async (
        action: ({ authenticated, signed }: { authenticated: boolean; signed: boolean }) => Promise<void>,
    ): Promise<void> => {
        const onAction = async (): Promise<void> => {
            await action({ authenticated, signed });
        };

        const onConnected = async (): Promise<void> => {
            await askForSignature(onAction);
        };

        try {
            if (!authenticated) {
                await showConnectOverlay(onConnected);

                return;
            }

            if (!signed) {
                await askForSignature(onAction);

                return;
            }

            await action({ authenticated, signed });
        } catch (error) {
            await showConnectOverlay(onConnected);
        }
    };

    return { signedAction, authenticatedAction };
};
