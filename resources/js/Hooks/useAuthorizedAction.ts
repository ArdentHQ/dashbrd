import { useMetaMaskContext } from "@/Contexts/MetaMaskContext";
import { useAuth } from "@/Hooks/useAuth";

export const useAuthorizedAction = (): {
    signedAction: (action: () => void) => void;
} => {
    const { authenticated } = useAuth();
    const { showConnectOverlay, signed, askForSignature } = useMetaMaskContext();

    const signedAction = (action: () => void): void => {
        if (!authenticated) {
            const onConnected = (): void => {
                const onSigned = action;

                askForSignature(onSigned);
            };

            showConnectOverlay(onConnected);

            return;
        }

        if (!signed) {
            const onSigned = action;

            askForSignature(onSigned);

            return;
        }

        action();
    };

    return { signedAction };
};
