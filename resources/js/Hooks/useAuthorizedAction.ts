import axios from "axios";
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
    const { authenticated, signed, setSigned, setAuthenticated } = useAuth();

    const { showConnectOverlay, askForSignature } = useMetaMaskContext();

    const authenticatedAction = async (action: AuthenticatedActionAction): Promise<void> => {
        const onAction = async (): Promise<void> => {
            await action({ authenticated });
        };

        if (!authenticated) {
            await showConnectOverlay(onAction);

            setAuthenticated(true);

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

                setAuthenticated(true);

                return;
            }

            if (!signed) {
                await askForSignature(onAction);

                setSigned(true);

                return;
            }

            await action({ authenticated, signed });
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const { status } = error.response ?? {};

                if ([403, 401, 419].includes(status ?? 0)) {
                    await showConnectOverlay(onConnected);
                }
            }
        }
    };

    return { signedAction, authenticatedAction };
};
