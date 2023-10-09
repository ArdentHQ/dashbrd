import axios from "axios";
import { useMetaMaskContext } from "@/Contexts/MetaMaskContext";

export const useAuthorizedAction = (): {
    signedAction: (
        action: ({ authenticated, signed }: { authenticated: boolean; signed: boolean }) => void,
    ) => Promise<void>;
    authenticatedAction: (action: ({ authenticated }: { authenticated: boolean }) => void) => Promise<void>;
} => {
    const { showConnectOverlay, askForSignature } = useMetaMaskContext();

    const signedAction = async (
        action: ({ authenticated, signed }: { authenticated: boolean; signed: boolean }) => void,
    ): Promise<void> => {
        const {
            data: { authenticated, signed },
        } = await axios.get<{
            authenticated: boolean;
            signed: boolean;
        }>(route("auth-status"));

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

    const authenticatedAction = async (
        action: ({ authenticated }: { authenticated: boolean }) => void,
    ): Promise<void> => {
        const {
            data: { authenticated },
        } = await axios.get<{
            authenticated: boolean;
            signed: boolean;
        }>(route("auth-status"));

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
