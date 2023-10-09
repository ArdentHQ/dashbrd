import { usePage } from "@inertiajs/react";
import { useEffect, useState } from "react";
import { useMetaMaskContext } from "@/Contexts/MetaMaskContext";

interface Properties {
    mustBeSigned?: boolean;
}

export const useAuth = ({ mustBeSigned = false }: Properties = {}): App.Data.AuthData & {
    showAuthOverlay: boolean;
    showCloseButton: boolean;
    closeOverlay: () => void;
} => {
    const [manuallyClosed, setManuallyClosed] = useState<boolean>(false);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { props } = usePage();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const auth = props.auth;

    const error = props.error;

    const allowsGuests = props.allowsGuests;

    const { wallet, authenticated, user, signed } = auth;

    const {
        connecting,
        switching,
        errorMessage: metamaskErrorMessage,
        requiresSignature,
        isShowConnectOverlay,
        hideConnectOverlay,
        onDisconnected,
    } = useMetaMaskContext();

    useEffect(() => {
        if (!authenticated) {
            onDisconnected();
        }
    }, [authenticated]);

    const closeOverlay = (): void => {
        hideConnectOverlay();

        setManuallyClosed(true);
    };

    useEffect(() => {
        setManuallyClosed(false);
    }, [connecting]);

    const showAuthOverlay = (): boolean => {
        if (mustBeSigned && !signed) {
            return true;
        }

        if (requiresSignature) {
            return true;
        }

        if (isShowConnectOverlay) {
            return true;
        }

        if (manuallyClosed) {
            return false;
        }

        if (error === true) {
            return false;
        }

        if (!authenticated && !allowsGuests) {
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

        return metamaskErrorMessage !== undefined;
    };

    const showCloseButton = allowsGuests || requiresSignature;

    return {
        authenticated,
        user,
        wallet,
        signed,
        showAuthOverlay: showAuthOverlay(),
        showCloseButton,
        closeOverlay,
    };
};
