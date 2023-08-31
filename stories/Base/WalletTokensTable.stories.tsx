import { BalanceHeader } from "@/Components/BalanceHeader";
import type { StoryFn, Meta } from "@storybook/react";
import { WalletTokensTable } from "@/Components/WalletTokens/WalletTokensTable";
import { fi } from "date-fns/locale";
import TokenListItemDataFactory from "@/Tests/Factories/Token/TokenListItemDataFactory";

export default {
    title: "Base/WalletTokensTable",
    argTypes: {
        isLoading: {
            defaultValue: true,
            control: "boolean",
        },
    },
} as Meta<typeof BalanceHeader>;

const fixtures = {
    user: {
        attributes: {
            currency: "USD",
            timezone: "UTC",
            date_format: "d/m/Y",
            time_format: "12" as "12" | "24",
        },
    },
};

const tokens = new TokenListItemDataFactory().createMany(20, {
    chain_id: 1,
});

export const Default = {
    args: {
        isLoading: false,
    },
    render: (args: { isLoading: boolean | undefined }) => {
        return (
            <div>
                <WalletTokensTable
                    isLoading={args.isLoading}
                    tokens={tokens}
                    currency={fixtures.user.attributes.currency}
                    user={fixtures.user}
                />
            </div>
        );
    },
};
