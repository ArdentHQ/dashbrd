import { isObject } from "@ardenthq/sdk-helpers";
import { type VisitOptions } from "@inertiajs/core";
import { router } from "@inertiajs/react";
import axios from "axios";
import { ethers, utils } from "ethers";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    type ERC20TokenContract,
    type Ethereum,
    type ProviderResponse,
    type SendTransactionRequest,
    type SendTransactionResponse,
} from "./useMetaMask.contracts";
import Chains = App.Enums.Chains;
import { useActiveUser } from "@/Contexts/ActiveUserContext";
import { browserLocale } from "@/Utils/browser-locale";
import { isTruthy } from "@/Utils/is-truthy";

const networkConfigs: Record<number, object> = {
    1: {
        chainId: "0x1",
        chainName: "Ethereum Mainnet",
        nativeCurrency: {
            name: "ETH",
            symbol: "ETH",
            decimals: 18,
        },
        rpcUrls: ["https://www.ethercluster.com/etc"],
        blockExplorerUrls: ["https://etherscan.io"],
    },
    5: {
        chainId: "0x5",
        chainName: "Goerli",
        nativeCurrency: {
            name: "ETH",
            symbol: "ETH",
            decimals: 18,
        },
        rpcUrls: ["https://eth-goerli.public.blastapi.io"],
        blockExplorerUrls: ["hhttps://goerli.etherscan.io"],
    },
    137: {
        chainId: "0x89",
        chainName: "Polygon Mainnet",
        nativeCurrency: {
            name: "MATIC",
            symbol: "MATIC",
            decimals: 18,
        },
        rpcUrls: ["https://polygon-rpc.com"],
        blockExplorerUrls: ["https://polygonscan.com"],
    },
    80001: {
        chainId: "0x13881",
        chainName: "Mumbai",
        nativeCurrency: {
            name: "MATIC",
            symbol: "MATIC",
            decimals: 18,
        },
        rpcUrls: ["https://rpc-mumbai.maticvigil.com"],
        blockExplorerUrls: ["https://mumbai.polygonscan.com"],
    },
};

const hasMetaMask = (): boolean => window.ethereum !== undefined;

const getEthereum = (): Ethereum => window.ethereum as Ethereum;

// Metamask supports Chrome, Firefox, Brave, Edge, and Opera, since Edge and
// Opera are based on Chromium, we can just check for Chrome and Firefox
// @see https://metamask.io/download/
const isMetaMaskSupportedBrowser = (): boolean => {
    // If the user has MetaMask installed, we can assume they are on a supported browser
    if (hasMetaMask()) {
        return true;
    }

    const isCompatible = /chrome|firefox/.test(navigator.userAgent.toLowerCase());
    const isMobile = /android|iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());

    return isCompatible && !isMobile;
};

const getSignMessage = async (chainId: number): Promise<string> =>
    await axios
        .post<{
            message: string;
        }>("/sign-message", { chainId })
        .then((response) => response.data.message);

export interface MetaMaskState {
    account?: string;
    chainId?: App.Enums.Chains;
    connectWallet: () => Promise<void>;
    connecting: boolean;
    initialized: boolean;
    needsMetaMask: boolean;
    supportsMetaMask: boolean;
    waitingSignature: boolean;
    errorMessage?: string;
    requiresSignature: boolean;
    switching: boolean;
    ethereumProvider?: ethers.providers.Web3Provider;
    sendTransaction: (t: SendTransactionRequest) => Promise<SendTransactionResponse>;
    switchToNetwork: (c: Chains) => Promise<void>;
    getTransactionReceipt: (hash: string) => Promise<ProviderResponse<ethers.providers.TransactionReceipt>>;
    getBlock: (blockHash: string) => Promise<ProviderResponse<ethers.providers.Block>>;
    hideConnectOverlay: () => void;
    showConnectOverlay: (onConnected?: () => void) => void;
    isShowConnectOverlay: boolean;
}

enum ErrorType {
    Generic,
    ProviderMissing,
    InvalidNetwork,
    NoAccount,
    UserRejected,
}

const ErrorTypes = {
    [ErrorType.NoAccount]: "no_account",
    [ErrorType.Generic]: "generic",
    // @TODO: Add something like "Please connect any of the following networks: XXXXX and try again", but we need a way
    // dynamically retrieve the network names before.
    [ErrorType.InvalidNetwork]: "invalid_network",
    [ErrorType.ProviderMissing]: "provider_missing",
    [ErrorType.UserRejected]: "user_rejected",
};

interface Properties {
    initialAuth: App.Data.AuthData;
}

const getWalletIsSigned = ({
    authenticated,
    wallet,
    metamaskWallet,
    metamaskChainId,
}: Pick<App.Data.AuthData, "authenticated" | "wallet"> & {
    metamaskWallet: string;
    metamaskChainId: number;
}): boolean => {
    if (!authenticated) {
        return true;
    }

    if (wallet === null) {
        return false;
    }

    return metamaskWallet.toLowerCase() === wallet.address.toLowerCase() && isTruthy(metamaskChainId);
};

/**
 * Note consider that the `initialAuth` property is not reactive, it contains
 * the initial auth state when page is loaded.
 */
const useMetaMask = ({ initialAuth }: Properties): MetaMaskState => {
    const { t } = useTranslation();

    const [initialized, setInitialized] = useState<boolean>(false);
    const [chainId, setChainId] = useState<App.Enums.Chains>();
    const [account, setAccount] = useState<string>();
    const [ethereumProvider, setEthereumProvider] = useState<ethers.providers.Web3Provider>();
    const [connecting, setConnecting] = useState<boolean>(false);
    const [switching, setSwitching] = useState<boolean>(false);
    const [requiresSignature, setRequiresSignature] = useState<boolean>(false);
    const [requiresSwitch, setRequiresSwitch] = useState<boolean>(false);
    const [waitingSignature, setWaitingSignature] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>();
    const [isShowConnectOverlay, setShowConnectOverlay] = useState<boolean>(false);
    const supportsMetaMask = isMetaMaskSupportedBrowser();
    const needsMetaMask = !hasMetaMask() || !supportsMetaMask;
    const [onConnected, setOnConnected] = useState<() => void>();

    const undefinedProviderError = t("auth.errors.metamask.provider_not_set");

    const { setAuthData } = useActiveUser();

    const switchUserWallet = async ({
        account: address,
        chainId,
    }: {
        account?: string;
        chainId?: App.Enums.Chains;
    }): Promise<void> => {
        setSwitching(true);

        await new Promise<void>((resolve) => {
            router.visit(route("switch-account"), {
                replace: true,
                method: "post" as VisitOptions["method"],
                // we need preserve stuff to ensure that app won't
                // lose state when we programmatically switch networks
                preserveState: true,
                preserveScroll: true,
                data: {
                    address,
                    chainId,
                },
                onError: () => {
                    setRequiresSignature(true);
                },
                onSuccess: () => {
                    setRequiresSignature(false);
                },
                onFinish: () => {
                    setSwitching(false);

                    resolve();
                },
            });
        });
    };

    const logout = async (): Promise<void> => {
        setSwitching(true);

        await new Promise<void>((resolve) => {
            router.visit(route("logout"), {
                replace: true,
                method: "post" as VisitOptions["method"],
                onFinish: () => {
                    setSwitching(false);

                    resolve();
                },
            });
        });
    };

    useEffect(() => {
        if (requiresSwitch) {
            setRequiresSwitch(false);

            void switchUserWallet({
                account,
                chainId,
            });
        }
    }, [requiresSwitch, account, chainId]);

    // Initialize the Web3Provider when the page loads
    useEffect(() => {
        if (!supportsMetaMask || needsMetaMask) {
            setInitialized(true);
            return;
        }

        const ethereum = getEthereum();

        let verifyNetworkInterval: ReturnType<typeof setInterval>;

        const initProvider = async (): Promise<void> => {
            const provider = new ethers.providers.Web3Provider(ethereum, "any");

            const [chain, accounts] = await Promise.all([provider.getNetwork(), provider.listAccounts()]);

            const account = accounts.length > 0 ? utils.getAddress(accounts[0]) : undefined;
            const chainId = chain.chainId as App.Enums.Chains;

            setAccount(account);

            setChainId(chainId);

            setEthereumProvider(provider);

            if (account !== undefined) {
                const currentWalletIsSigned = getWalletIsSigned({
                    ...initialAuth,
                    metamaskWallet: account,
                    metamaskChainId: chainId,
                });

                if (!currentWalletIsSigned) {
                    setRequiresSwitch(true);
                }
            }

            setInitialized(true);

            // The MetaMask app contains some invalid (deprecated) networks,
            // which, when changing from a valid network to them (for example,
            // changing from "Polygon Network" to "Kovan Test Network"), simply
            // do not trigger the `chainChanged` event. To prevent issues
            // regarding this, I added the following timeout that checks and
            // updates the selected network in case is outdated.
            const updateChainId = async (): Promise<void> => {
                const { chainId } = await provider.getNetwork();

                setChainId(chainId as App.Enums.Chains);
            };

            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            verifyNetworkInterval = setInterval(updateChainId, 1000);
        };

        void initProvider();

        const accountChangedListener = (accounts: string[]): void => {
            setAccount(accounts.length > 0 ? utils.getAddress(accounts[0]) : undefined);

            if (accounts.length === 0) {
                void logout();
            } else {
                setRequiresSwitch(true);
            }
        };

        const chainChangedListener = (chainId: string): void => {
            // Chain ID came in as a hex string, so we need to convert it to decimal
            setChainId(Number.parseInt(chainId, 16) as App.Enums.Chains);

            setRequiresSwitch(true);
        };
        const connectListener = ({ chainId }: { chainId: string }): void => {
            chainChangedListener(chainId);
        };

        const disconnectListener = (): void => {
            setChainId(undefined);
        };

        ethereum.on("accountsChanged", accountChangedListener);

        ethereum.on("chainChanged", chainChangedListener);

        ethereum.on("disconnect", disconnectListener);

        // Connect event is fired when the user is disconnected because an error
        // (e.g. the network is invalid) and then switches to a valid network
        ethereum.on("connect", connectListener);

        return () => {
            ethereum.removeListener("accountsChanged", accountChangedListener);
            ethereum.removeListener("chainChanged", chainChangedListener);
            ethereum.removeListener("connect", connectListener);
            ethereum.removeListener("disconnect", disconnectListener);

            clearInterval(verifyNetworkInterval);
        };
    }, []);

    const requestChainAndAccount = useCallback(async () => {
        try {
            if (ethereumProvider === undefined) {
                throw new Error(undefinedProviderError);
            }

            // At this point we know for sure that the `ethereumProvider` is set
            const [accounts, chainIdAsHex] = (await Promise.all([
                ethereumProvider.send("eth_requestAccounts", []),
                ethereumProvider.send("eth_chainId", []),
            ])) as [string[], string];

            const chainId = Number.parseInt(chainIdAsHex, 16) as App.Enums.Chains;

            return {
                account: accounts.length > 0 ? accounts[0] : undefined,
                chainId,
            };
        } catch {
            return {
                account: undefined,
                chainId: undefined,
            };
        }
    }, [ethereumProvider]);

    const getSignature = useCallback(
        async (message: string) => {
            if (ethereumProvider === undefined) {
                throw new Error("Ethereum provider is not set");
            }

            const signer = ethereumProvider.getSigner();
            const [address, signature] = await Promise.all([signer.getAddress(), signer.signMessage(message)]);

            return {
                address,
                signature,
            };
        },
        [ethereumProvider],
    );

    const onError = useCallback((error: ErrorType, errorMessage?: string) => {
        setErrorMessage(errorMessage ?? t(`auth.errors.metamask.${ErrorTypes[error]}`).toString());

        setConnecting(false);
    }, []);

    const showConnectOverlay = (onConnected?: () => void): void => {
        setShowConnectOverlay(true);

        setOnConnected(() => onConnected);
    };

    const hideConnectOverlay = (): void => {
        setShowConnectOverlay(false);

        setErrorMessage(undefined);

        setOnConnected(undefined);
    };

    const connectWallet = useCallback(async () => {
        setConnecting(true);

        setErrorMessage(undefined);

        const { chainId, account } = await requestChainAndAccount();

        if (account === undefined) {
            onError(ErrorType.NoAccount);
            return;
        }

        let signMessage: string;

        try {
            signMessage = await getSignMessage(chainId);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 422) {
                    onError(
                        ErrorType.Generic,
                        (
                            error.response.data as {
                                message: string;
                            }
                        ).message,
                    );
                } else {
                    onError(ErrorType.Generic);
                }
            } else {
                onError(ErrorType.Generic);
            }

            return;
        }

        let signature: string;
        let address: string;

        setWaitingSignature(true);

        try {
            const result = await getSignature(signMessage);
            signature = result.signature;
            address = result.address;

            setWaitingSignature(false);
        } catch (error) {
            onError(ErrorType.UserRejected);

            setWaitingSignature(false);
            return;
        }

        try {
            const data = await axios.post(route("login"), {
                intendedUrl: window.location.href,
                address,
                signature,
                chainId,
                tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
                locale: browserLocale(),
            });

            setAuthData?.(data.data.auth);
            router.reload();
        } catch (error) {
            const firstError = [error.address, error.signature, error.chainId].find(
                (value) => typeof value === "string",
            );

            onError(ErrorType.Generic, firstError);
        } finally {
            setAccount(account);

            setChainId(chainId);

            setConnecting(false);

            setRequiresSignature(false);

            hideConnectOverlay();

            if (onConnected !== undefined) {
                onConnected();
            }
        }

        // router.visit(route("login"), {
        //     replace: true,
        //     method: "post" as VisitOptions["method"],
        //     data: {
        //         intendedUrl: window.location.href,
        //         address,
        //         signature,
        //         chainId,
        //         tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
        //         locale: browserLocale(),
        //     },
        //     onSuccess: (data) => {
        //         console.log(data);
        //     },
        //     onError: (error) => {
        //         const firstError = [error.address, error.signature, error.chainId].find(
        //             (value) => typeof value === "string",
        //         );
        //
        //         onError(ErrorType.Generic, firstError);
        //     },
        //     onFinish: () => {
        //         setAccount(account);
        //
        //         setChainId(chainId);
        //
        //         setConnecting(false);
        //
        //         setRequiresSignature(false);
        //
        //         hideConnectOverlay();
        //
        //         if (onConnected !== undefined) {
        //             onConnected();
        //         }
        //     },
        // });
    }, [requestChainAndAccount, router, getSignature, onConnected]);

    const addNetwork = async (chainId: Chains): Promise<void> => {
        if (ethereumProvider === undefined) {
            throw new Error(undefinedProviderError);
        }

        if (!(chainId in networkConfigs)) {
            throw new Error("Config does not exist for the given chain ID");
        }

        await ethereumProvider.send("wallet_addEthereumChain", [networkConfigs[chainId]]);

        const { chainId: currentChainId } = await requestChainAndAccount();

        // check if chain switched to the given chain
        if (chainId !== currentChainId) {
            throw new Error("Couldn't switch to the given chain");
        }
    };

    const switchToNetwork = async (chainId: Chains): Promise<void> => {
        if (ethereumProvider === undefined) {
            throw new Error(undefinedProviderError);
        }

        try {
            await ethereumProvider.send("wallet_switchEthereumChain", [{ chainId: ethers.utils.hexValue(chainId) }]);
        } catch (error) {
            // This error code indicates that the chain has not been added to MetaMask.
            if (isObject(error) && "code" in error && error.code === 4902) {
                await addNetwork(chainId);
                return;
            }
            throw new Error("Error occurred when switching to network");
        }
    };

    const sendTransaction = async ({
        token,
        recipient,
        amount,
        maxFeePerGas,
        maxPriorityFeePerGas,
    }: SendTransactionRequest): Promise<SendTransactionResponse> => {
        if (ethereumProvider === undefined) {
            throw new Error(undefinedProviderError);
        }

        if (account === undefined) {
            throw new Error("Account is not set");
        }

        // Get the signer (selected account)
        const signer = ethereumProvider.getSigner();

        const maxFeePerGasBN = ethers.utils.parseUnits(maxFeePerGas, "gwei");
        const maxPriorityFeePerGasBN = ethers.utils.parseUnits(maxPriorityFeePerGas, "gwei");

        try {
            if (["eth", "matic"].includes(token.symbol.toLowerCase())) {
                const transaction = await signer.sendTransaction({
                    from: await signer.getAddress(),
                    to: recipient,
                    value: ethers.utils.parseUnits(amount, token.decimals),
                    nonce: ethereumProvider.getTransactionCount(account, "latest"),
                    maxFeePerGas: maxFeePerGasBN,
                    maxPriorityFeePerGas: maxPriorityFeePerGasBN,
                });

                return {
                    hash: transaction.hash,
                };
            } else {
                // token ABIs are the same for the ERC-20 tokens
                const tokenAbi = ["function transfer(address to, uint256 value)"];

                const contract = new ethers.Contract(token.address, tokenAbi, signer) as ERC20TokenContract;

                const numberOfTokens = ethers.utils.parseUnits(amount, token.decimals);

                const transaction = await contract.transfer(recipient, numberOfTokens, {
                    maxFeePerGas: maxFeePerGasBN,
                    maxPriorityFeePerGas: maxPriorityFeePerGasBN,
                });

                return {
                    hash: transaction.hash,
                };
            }
        } catch (error) {
            return {
                errorMessage: "Unexpected error occurred",
            };
        }
    };

    const getTransactionReceipt = async (
        transactionHash: string,
    ): Promise<ProviderResponse<ethers.providers.TransactionReceipt>> => {
        if (ethereumProvider === undefined) {
            throw new Error(undefinedProviderError);
        }

        try {
            const receipt = await ethereumProvider.waitForTransaction(transactionHash);

            return { data: receipt };
        } catch (error) {
            return { errorMessage: "Error occurred while getting a transaction receipt" };
        }
    };

    const getBlock = async (blockHash: string): Promise<ProviderResponse<ethers.providers.Block>> => {
        if (ethereumProvider === undefined) {
            throw new Error(undefinedProviderError);
        }

        try {
            const block = await ethereumProvider.getBlock(blockHash);
            return { data: block };
        } catch (error) {
            return { errorMessage: "Error occurred while getting a " };
        }
    };

    return {
        account,
        chainId,
        connectWallet,
        connecting,
        initialized,
        needsMetaMask,
        supportsMetaMask,
        errorMessage,
        waitingSignature,
        switching,
        requiresSignature,
        ethereumProvider,
        sendTransaction,
        switchToNetwork,
        getTransactionReceipt,
        getBlock,
        showConnectOverlay,
        hideConnectOverlay,
        isShowConnectOverlay,
    };
};

export default useMetaMask;
