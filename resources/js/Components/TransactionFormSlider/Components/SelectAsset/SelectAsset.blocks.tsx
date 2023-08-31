import { Listbox } from "@/Components/Form/Listbox";
import { TokenLogo } from "@/Components/Tokens/TokenLogo";
import { isTruthy } from "@/Utils/is-truthy";

export const AssetAvatar = ({ asset }: { asset?: App.Data.TokenListItemData }): JSX.Element => {
    if (isTruthy(asset)) {
        return (
            <TokenLogo
                tokenName={asset.name}
                imgSource={asset.logo_url}
                className="-mt-1 h-8 w-8"
                chainId={asset.chain_id}
                networkIconSize="sm"
            />
        );
    }

    return <Listbox.Avatar variant={"primary"} />;
};
