import { type MetaMaskState } from "@/Hooks/useMetaMask";

export const getSampleMetaMaskState = (overrides: Partial<MetaMaskState> = {}): MetaMaskState => ({
    needsMetaMask: false,
    connectWallet: vi.fn(),
    initialized: true,
    connecting: false,
    switching: false,
    errorMessage: undefined,
    waitingSignature: false,
    requiresSignature: false,
    supportsMetaMask: true,
    sendTransaction: vi.fn(),
    switchToNetwork: vi.fn(),
    chainId: 80001 as App.Enums.Chains,
    getBlock: vi.fn(),
    getTransactionReceipt: vi.fn(),
    account: "0xE68cDB02e9453DD7c66f53AceA5CEeAD2ecd637A",
    hideConnectOverlay: vi.fn(),
    showConnectOverlay: vi.fn(),
    isShowConnectOverlay: false,
    ...overrides,
});
