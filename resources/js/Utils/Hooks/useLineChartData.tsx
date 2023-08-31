import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
    type LineChartPriceHistoryData,
    type LineChartPriceHistoryDataContext,
    type WithLineChartDataProperties,
} from "./useLineChartData.contracts";
import { getLineChartPriceHistory } from "@/Utils/api";

const LineChartDataContext = createContext<LineChartPriceHistoryDataContext | undefined>(undefined);

export const WithLineChartData = ({ children, currency, symbols }: WithLineChartDataProperties): JSX.Element => {
    const [errored, setErrored] = useState<boolean>(false);
    const [chartData, setChartData] = useState<LineChartPriceHistoryData>();
    const [loadingSymbols, setLoadingSymbols] = useState<string[]>([]);
    const [loadedSymbols, setLoadedSymbols] = useState<string[]>([]);

    const missingSymbols = useMemo(
        // Using string so it can be used as a key on useEffect
        () => symbols.filter((symbol) => !loadedSymbols.includes(symbol) && !loadingSymbols.includes(symbol)).join(","),
        [loadedSymbols, loadingSymbols, symbols],
    );

    useEffect(() => {
        if (currency === "" || missingSymbols === "") {
            return;
        }

        const loadLineChartData = async (): Promise<void> => {
            const subjectSymbols = missingSymbols.split(",");

            try {
                // Set the loaded symbols even considering that the request is pending
                // so more requests are not made for the same symbol
                setLoadingSymbols((previousLoadingSymbols) => [...previousLoadingSymbols, ...subjectSymbols]);

                const data = await getLineChartPriceHistory({ currency, symbols: subjectSymbols });

                setChartData((previousChartData) => ({
                    ...(previousChartData ?? {}),
                    ...data,
                }));
            } catch {
                setErrored(true);
            } finally {
                setLoadingSymbols((previousLoadingSymbols) =>
                    previousLoadingSymbols.filter((symbol) => !subjectSymbols.includes(symbol)),
                );

                setLoadedSymbols((previousLoadedSymbols) => [...previousLoadedSymbols, ...subjectSymbols]);
            }
        };

        void loadLineChartData();
    }, [missingSymbols]);

    return (
        <LineChartDataContext.Provider value={{ chartData, loadedSymbols, errored }}>
            {children}
        </LineChartDataContext.Provider>
    );
};

export const useLineChartData = (): LineChartPriceHistoryDataContext => {
    const context = useContext(LineChartDataContext);

    if (context === undefined) {
        throw new Error("useLineChartData must be within WithLineChartData");
    }

    return context;
};
