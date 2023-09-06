import { useMetaMaskContext } from "@/Contexts/MetaMaskContext";
import { useAuth } from "@/Hooks/useAuth";

export const useAuthorizedAction = (): {
    signedAction: (action: ({ authenticated, signed }: { authenticated: boolean; signed: boolean }) => void) => void;
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
                console.log("action fter conntec");
                askForSignature(onAction);
            };

            showConnectOverlay(onConnected);

            return;
        }

        if (!signed) {
            askForSignature(onAction);

            return;
        }

        console.log("action 2");
        action({ authenticated, signed });
    };

    return { signedAction };
};
