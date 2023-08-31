import { usePage } from "@inertiajs/react";
import { useMemo } from "react";
import { useMetaMaskContext } from "@/Contexts/MetaMaskContext";

export const useAuth = (): App.Data.AuthData & {
    showAuthOverlay: boolean;
} => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { props } = usePage();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const auth = props.auth;

    const error = props.error;

    const { wallet, authenticated, user } = auth;

    const { connecting, switching, errorMessage: metamaskErrorMessage, requiresSignature } = useMetaMaskContext();

    const showAuthOverlay = useMemo<boolean>(() => {
        if (error === true) {
            return false;
        }

        if (!authenticated) {
            return true;
        }

        if (props.environment === "testing_e2e" && props.testingWallet !== null) {
            return false;
        }

        if (switching) {
            return true;
        }

        if (connecting) {
            return true;
        }

        if (metamaskErrorMessage !== undefined) {
            return true;
        }

        return requiresSignature;
    }, [authenticated, connecting, metamaskErrorMessage, requiresSignature, switching, error]);

    return {
        authenticated,
        user,
        wallet,
        showAuthOverlay,
    };
};
