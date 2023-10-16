import { usePage } from "@inertiajs/react";
import { useEffect, useState } from "react";
import { useActiveUser } from "@/Contexts/ActiveUserContext";
import { useMetaMaskContext } from "@/Contexts/MetaMaskContext";

interface Properties {
    mustBeSigned?: boolean;
}

export const useAuth = ({ mustBeSigned = false }: Properties = {}): App.Data.AuthData & {
    showAuthOverlay: boolean;
    showCloseButton: boolean;
    signed: boolean;
    closeOverlay: () => void;
    setSigned: (signed: boolean) => void;
    setAuthenticated: (authenticated: boolean) => void;
} => {
    const [manuallyClosed, setManuallyClosed] = useState<boolean>(false);

    const { wallet, user, authenticated, signed } = useActiveUser();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { props } = usePage();

    const error = props.error;

    const allowsGuests = props.allowsGuests;

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
        signed,
        user,
        wallet,
        showAuthOverlay: showAuthOverlay(),
        showCloseButton,
        closeOverlay,
    };
};
