import classNames from "classnames";
import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { type DonutChartProperties, type TooltipProperties } from "./DonutChart.contracts";
import { getBackgroundColor } from "./PortfolioBreakdown.helpers";
import { DonutGraph } from "@/Components/Graphs/DonutGraph/DonutGraph";
import { type AddToOtherGroupFunction, type GraphDataPoint } from "@/Components/Graphs/Graphs.contracts";
import { useGraphData } from "@/Components/Graphs/Hooks/useGraphData";
import { Icon } from "@/Components/Icon";
import { FormatFiat } from "@/Utils/Currency";
import { formatPercentage } from "@/Utils/format-percentage";

const Tooltip = ({ dataPoint: { data, formatted } }: TooltipProperties): JSX.Element => (
    <div
        data-testid="DonutChart__tooltip"
        className="flex items-center space-x-2 rounded bg-theme-secondary-900 px-3 py-2 text-sm font-semibold"
    >
        <div className="flex items-center space-x-2">
            <div className={classNames("h-4 w-0.5 rounded", getBackgroundColor(data.index))} />

            <span
                data-testid="DonutChart__tooltip-label"
                className="text-white"
            >
                {data.label}
            </span>

            <span
                data-testid="DonutChart__tooltip-percentage"
                className="text-theme-secondary-500"
            >
                {formatted}
            </span>
        </div>

        <div className="flex items-center space-x-2">
            <div className="h-[5px] w-[5px] rounded-full bg-theme-secondary-800"></div>

            <span className="text-theme-secondary-500">
                <FormatFiat value={data.value.toString()} />
            </span>
        </div>
    </div>
);

export const DonutChart = ({ assets, currency, size = 276 }: DonutChartProperties): JSX.Element => {
    const { t } = useTranslation();

    const totalValue = assets.reduce(
        (partialSum: number, asset: App.Data.TokenPortfolioData): number => partialSum + Number(asset.fiat_balance),
        0,
    );

    const addToOtherGroup = useCallback<AddToOtherGroupFunction>(
        (otherGroup, dataPoint) => {
            const percentage = (otherGroup?.value ?? 0) + dataPoint.value;
            const balance = (otherGroup?.data.value ?? 0) + dataPoint.data.value;

            return {
                data: {
                    ...dataPoint.data,
                    index: -1,
                    value: balance,
                    label: t("common.other"),
                },
                formatted: formatPercentage(percentage),
                value: percentage,
            };
        },
        [t],
    );

    const { group } = useGraphData("donut", addToOtherGroup);

    const donutGraphData = useMemo<GraphDataPoint[]>(
        () =>
            group(
                assets.map((asset, index) => ({
                    data: {
                        label: asset.symbol,
                        index,
                        value: Number(asset.fiat_balance),
                    },
                    formatted: formatPercentage(Number(asset.percentage) * 100),
                    value: Number(asset.percentage) * 100,
                })),
                size,
            ),
        [assets, group],
    );

    return (
        <DonutGraph
            size={size}
            data={donutGraphData}
            renderTooltip={
                donutGraphData.length > 0 ? (dataPoint: GraphDataPoint) => <Tooltip dataPoint={dataPoint} /> : undefined
            }
        >
            <div
                data-testid="DonutChart__content"
                className="flex flex-col items-center justify-center"
            >
                <Icon
                    name="Wallet"
                    className="bg-theme-primary-50 text-theme-primary-600"
                    size="lg"
                />

                <div className="mt-2 text-sm font-medium text-theme-secondary-700">{t("common.my_balance")}</div>

                <div className="text-lg font-medium">
                    <FormatFiat
                        value={totalValue.toString()}
                        currency={currency}
                    />
                </div>
            </div>
        </DonutGraph>
    );
};
