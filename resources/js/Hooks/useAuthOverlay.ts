import { usePage } from "@inertiajs/react";
import { useEffect, useState } from "react";
import { useActiveUser } from "@/Contexts/ActiveUserContext";
import { useMetaMaskContext } from "@/Contexts/MetaMaskContext";

interface Properties {
    mustBeSigned?: boolean;
}

export const useAuthOverlay = ({ mustBeSigned = false }: Properties = {}): {
    showAuthOverlay: boolean;
    showCloseButton: boolean;
    closeOverlay: () => void;
} => {
    const [manuallyClosed, setManuallyClosed] = useState<boolean>(false);

    const { authenticated, signed } = useActiveUser();

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
    } = useMetaMaskContext();

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
        showAuthOverlay: showAuthOverlay(),
        showCloseButton,
        closeOverlay,
    };
};
