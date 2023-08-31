import Jazzicon, { jsNumberForAddress } from "react-jazzicon";

interface Properties {
    address: string;
    size?: number;
    avatar?: App.Data.Wallet.WalletAvatarData;
}

export const Avatar = ({ address, size = 20, avatar }: Properties): JSX.Element => {
    if (avatar?.default !== null && avatar?.default !== undefined) {
        const sourceSet = [
            avatar.small !== null ? `${avatar.small} 1x` : null,
            avatar.small2x !== null ? `${avatar.small2x} 2x` : null,
        ]
            .filter((value) => value !== null)
            .join(", ");

        return (
            <img
                data-testid="Avatar__image"
                src={avatar.default}
                srcSet={sourceSet}
                className="rounded-full"
                style={{ width: size, height: size }}
            />
        );
    }
    return (
        <Jazzicon
            diameter={size}
            seed={jsNumberForAddress(address)}
        />
    );
};
