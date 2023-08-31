import { Tooltip } from "@/Components/Tooltip";
import { FormatFiat, FormatFiatShort } from "@/Utils/Currency";

interface Properties {
    balance: string;
    currency: string;
}

export const DynamicBalance = ({ balance, currency }: Properties): JSX.Element => {
    if (+balance < 1_000_000) {
        return (
            <FormatFiat
                value={balance}
                currency={currency}
            />
        );
    }

    return (
        <Tooltip
            content={
                <FormatFiat
                    value={balance}
                    currency={currency}
                />
            }
        >
            <span data-testid="Tooltip__DynamicBalance__Short">
                <FormatFiatShort
                    value={balance}
                    currency={currency}
                    maxDecimals={2}
                />
            </span>
        </Tooltip>
    );
};
