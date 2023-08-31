import axios from "axios";
import uniq from "lodash/uniq";
import { type GetPriceHistoryProperties } from "@/Utils/api.contracts";

const getPriceHistory = async ({
    token,
    currency,
    period,
    ...query
}: GetPriceHistoryProperties): Promise<App.Data.PriceHistoryData[]> => {
    const response = await axios.post<App.Data.PriceHistoryData[]>(route("price_history"), {
        token,
        currency: currency.toUpperCase(),
        period,
        ...query,
    });

    return response.data;
};

const getLineChartPriceHistory = async ({
    currency,
    symbols,
}: {
    currency: string;
    symbols: string[];
}): Promise<Record<string, App.Data.PriceHistoryData[]>> => {
    const response = await axios.post<Record<string, App.Data.PriceHistoryData[]>>(route("line_chart_data"), {
        currency: currency.toUpperCase(),
        symbols: uniq(symbols).join(","),
    });

    return response.data;
};

export { getPriceHistory, getLineChartPriceHistory };
