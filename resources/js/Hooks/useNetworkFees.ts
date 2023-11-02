import { useEffect, useState } from "react";
import { type FeeData } from "@/Utils/api.contracts";
import { Explorer } from "@/Utils/Explorer";

interface NetworkFeesState {
    isLoading: boolean;
    error: string | null;
    networkFees?: FeeData[];
}

export const useNetworkFees = ({ chainId }: { chainId?: App.Enums.Chain }): NetworkFeesState => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [networkFees, setNetworkFees] = useState<FeeData[] | undefined>();

    // this is a magic number - because the numbers are in gwei format
    // - that fixes fractional component exceeds decimals error
    const FRACTION_DECIMALS = 9;

    useEffect(() => {
        if (chainId === undefined) {
            return;
        }

        const explorer = new Explorer(chainId);

        const fetchNetworkFees = async (): Promise<void> => {
            try {
                setIsLoading(true);

                const { suggestBaseFee, ProposeGasPrice, FastGasPrice, SafeGasPrice } = await explorer.fees();

                const baseFee = Number(suggestBaseFee);

                const fees: FeeData[] = [
                    {
                        type: "Fast",
                        maxFee: FastGasPrice,
                        maxPriorityFee: (Number(FastGasPrice) - baseFee).toFixed(FRACTION_DECIMALS).toString(),
                    },
                    {
                        type: "Avg",
                        maxFee: ProposeGasPrice,
                        maxPriorityFee: (Number(ProposeGasPrice) - baseFee).toFixed(FRACTION_DECIMALS).toString(),
                    },
                    {
                        type: "Slow",
                        maxFee: SafeGasPrice,
                        maxPriorityFee: (Number(SafeGasPrice) - baseFee).toFixed(FRACTION_DECIMALS).toString(),
                    },
                ];

                setNetworkFees(fees);
            } catch (error) {
                setError("Error occurred while loading fees");
            } finally {
                setIsLoading(false);
            }
        };

        void fetchNetworkFees();
    }, [chainId]);

    return {
        isLoading,
        error,
        networkFees,
    };
};
