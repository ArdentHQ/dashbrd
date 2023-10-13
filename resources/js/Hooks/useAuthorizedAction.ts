import { useMetaMaskContext } from "@/Contexts/MetaMaskContext";
import { useAuth } from "@/Hooks/useAuth";

type SignedActionAction =
    | (({ authenticated, signed }: { authenticated: boolean; signed: boolean }) => Promise<void>)
    | (({ authenticated, signed }: { authenticated: boolean; signed: boolean }) => void);

type AuthenticatedActionAction =
    | (({ authenticated }: { authenticated: boolean }) => Promise<void>)
    | (({ authenticated }: { authenticated: boolean }) => void);

export const useAuthorizedAction = (): {
    signedAction: (action: SignedActionAction) => Promise<void>;
    authenticatedAction: (action: AuthenticatedActionAction) => Promise<void>;
} => {
    const { authenticated } = useAuth();
    const { showConnectOverlay, signed, askForSignature } = useMetaMaskContext();

    const authenticatedAction = async (action: AuthenticatedActionAction): Promise<void> => {
        const onAction = async (): Promise<void> => {
            await action({ authenticated });
        };

        if (!authenticated) {
            await showConnectOverlay(onAction);

            return;
        }

        await action({ authenticated });
    };

    const signedAction = async (action: SignedActionAction): Promise<void> => {
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
