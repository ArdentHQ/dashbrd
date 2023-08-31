import axios from "axios";
import { useEffect, useState } from "react";
import TokenListItemData = App.Data.TokenListItemData;
import TokenPriceData = App.Data.Token.TokenPriceData;

export interface NativeTokenResponse {
    token: App.Data.Token.TokenData;
    tokenPrice: TokenPriceData;
}

export const useNativeToken = ({
    asset,
    onResolve,
}: {
    asset?: TokenListItemData;
    onResolve?: (data: NativeTokenResponse) => void;
}): NativeTokenResponse | undefined => {
    const [data, setData] = useState<NativeTokenResponse>();

    useEffect(() => {
        if (asset?.symbol === undefined) {
            return;
        }

        const getNativeToken = async (): Promise<void> => {
            const { data } = await axios.get<NativeTokenResponse>(
                route("tokens.network-native-token", {
                    token: asset.address,
                    network: asset.network_id,
                }),
            );
            setData(data);
            onResolve?.(data);
        };

        void getNativeToken();
    }, [asset?.symbol]);

    return data;
};
