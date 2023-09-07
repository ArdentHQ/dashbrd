import { usePage } from "@inertiajs/react";
import { useEffect, useMemo, useState } from "react";
import { useMetaMaskContext } from "@/Contexts/MetaMaskContext";

export const useAuth = (): App.Data.AuthData & {
    showAuthOverlay: boolean;
    showCloseButton: boolean;
    signed: boolean;
    closeOverlay: () => void;
} => {
    const [manuallyClosed, setManuallyClosed] = useState<boolean>(false);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { props } = usePage();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const auth = props.auth;

    const error = props.error;

    const allowsGuests = props.allowsGuests;

    const { wallet, authenticated, user } = auth;

    const {
        signed,
        connecting,
        switching,
        errorMessage: metamaskErrorMessage,
        requiresSignature,
        isShowConnectOverlay,
        hideConnectOverlay,
    } = useMetaMaskContext();

    const closeOverlay = (): void => {
        hideConnectOverlay();

        setManuallyClosed(true);
    };

    useEffect(() => {
        setManuallyClosed(false);
    }, [connecting]);

    const showAuthOverlay = useMemo<boolean>(() => {
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
    }, [
        authenticated,
        connecting,
        metamaskErrorMessage,
        requiresSignature,
        switching,
        error,
        allowsGuests,
        manuallyClosed,
        isShowConnectOverlay,
    ]);

    const showCloseButton = allowsGuests || requiresSignature;

    return {
        authenticated,
        signed,
        user,
        wallet,
        showAuthOverlay,
        showCloseButton,
        closeOverlay,
    };
};
