import { action } from "@storybook/addon-actions";
import type { StoryFn, Meta } from "@storybook/react";

import { Table, TableCell, TableRow } from "@/Components/Table";
import { PriceChange } from "@/Components/PriceChange/PriceChange";

export default {
    title: "Base/Table",
    component: Table,
    argTypes: {
        onClick: {
            control: "boolean",
        },
    },
} as Meta<typeof Table>;

const columns = [
    {
        Header: "Coin",
        accessor: "Coin",
    },
    {
        Header: "Balance",
        accessor: "Balance",
        className: "justify-end",
    },
    {
        Header: "Price",
        accessor: "Price",
        className: "justify-end",
    },
];

const data: {
    id: string;
    title: string;
    subtitle: string;
    balance: string;
    token: string;
    price: string;
    change: number;
}[] = [
    {
        id: "Coin",
        title: "ARK",
        subtitle: "ARK",
        balance: "$3,469.72",
        token: "760.9032304 ARK",
        price: "$4.56",
        change: 352.3,
    },
    {
        id: "Coin",
        title: "MATIC",
        subtitle: "MATIC",
        balance: "$3,469.72",
        token: "4,532.53246 MATIC",
        price: "$1.09",
        change: 2.3,
    },
    {
        id: "Coin",
        title: "OLEGBANK",
        subtitle: "OLEGBANK",
        balance: "$3,469.72",
        token: "4,532.53246 OLEG",
        price: "$1.09",
        change: -20.3,
    },
    {
        id: "Rok",
        title: "ROK",
        subtitle: "ROK",
        balance: "$0.00",
        token: "9,9999.00 ROK",
        price: "$0.00",
        change: 0.0,
    },
];

const DefaultVariant: StoryFn<typeof Table> = ({ onClick, ...args }) => (
    <Table
        data={data}
        columns={columns}
        row={(row) => (
            <TableRow onClick={onClick === true ? action("onClick") : undefined}>
                <TableCell variant="start">
                    <div>
                        <div className="font-medium">{row.title}</div>
                        <div className="text-theme-secondary-500">{row.subtitle}</div>
                    </div>
                </TableCell>
                <TableCell innerClassName="justify-end text-right">
                    <div>
                        <div className="font-medium">{row.balance}</div>
                        <div className="text-theme-secondary-500">{row.token}</div>
                    </div>
                </TableCell>
                <TableCell
                    variant="end"
                    innerClassName="justify-end text-right"
                >
                    <div>
                        <div className="text-theme-secondary-700">{row.price}</div>
                        <PriceChange change={row.change} />
                    </div>
                </TableCell>
            </TableRow>
        )}
        {...args}
    />
);

const BorderlessVariant: StoryFn<typeof Table> = ({ onClick, ...args }) => (
    <Table
        variant="borderless"
        data={data}
        columns={columns}
        row={(row) => (
            <TableRow onClick={onClick === true ? action("onClick") : undefined}>
                <TableCell variant="start">
                    <div>
                        <div className="font-medium">{row.title}</div>
                        <div className="text-theme-secondary-500">{row.subtitle}</div>
                    </div>
                </TableCell>
                <TableCell innerClassName="justify-end text-right">
                    <div>
                        <div className="font-medium">{row.balance}</div>
                        <div className="text-theme-secondary-500">{row.token}</div>
                    </div>
                </TableCell>
                <TableCell
                    variant="end"
                    innerClassName="justify-end text-right"
                >
                    <div>
                        <div className="text-theme-secondary-700">{row.price}</div>
                        <div className="text-theme-success-600">{row.change}</div>
                    </div>
                </TableCell>
            </TableRow>
        )}
        {...args}
    />
);

export const Default = DefaultVariant.bind({});
export const Borderless = BorderlessVariant.bind({});

Default.args = {
    data,
};
