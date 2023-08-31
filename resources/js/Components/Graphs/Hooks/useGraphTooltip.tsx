import React, { type MouseEvent, useCallback, useRef, useState } from "react";
import { type GraphDataPoint, type GraphType } from "@/Components/Graphs/Graphs.contracts";

interface UseGraphTooltipHook {
    Tooltip: React.FC;
    getMouseEventProperties: (dataPoint: GraphDataPoint) => {
        onMouseEnter?: (event: MouseEvent<SVGElement>) => void;
        onMouseMove?: (event: MouseEvent<SVGElement>) => void;
        onMouseOut?: () => void;
    };
}

const useGraphTooltip = (
    renderFunction: ((dataPoint: GraphDataPoint) => JSX.Element) | undefined,
    type: GraphType,
): UseGraphTooltipHook => {
    const timeout = useRef<number>();
    const tooltipReference = useRef<HTMLDivElement | null>(null);

    const [tooltipDataPoint, setTooltipDataPoint] = useState<GraphDataPoint | null>(null);

    const transformTooltip = useCallback(
        (event: MouseEvent<SVGElement>) => {
            const tooltipElement = tooltipReference.current as HTMLDivElement;
            const targetRect = (event.target as SVGElement).getBoundingClientRect();

            tooltipElement.style.left = `${event.pageX - targetRect.left - 32}px`;
            tooltipElement.style.top = `${event.pageY - targetRect.top - document.documentElement.scrollTop - 24}px`;

            tooltipElement.classList.remove("hidden");
            tooltipElement.classList.remove("opacity-0");
            tooltipElement.classList.add("opacity-100");
        },
        [type],
    );

    const getMouseEventProperties = (dataPoint: GraphDataPoint): Record<string, React.MouseEventHandler> => ({
        onMouseEnter: (event: MouseEvent<SVGElement>) => {
            window.clearTimeout(timeout.current);

            setTooltipDataPoint(dataPoint);

            transformTooltip(event);
        },
        onMouseMove: (event: MouseEvent<SVGElement>) => {
            transformTooltip(event);
        },
        onMouseOut: () => {
            tooltipReference.current?.classList.remove("hidden");
            tooltipReference.current?.classList.add("opacity-0");
            tooltipReference.current?.classList.remove("opacity-100");

            timeout.current = window.setTimeout(() => {
                tooltipReference.current?.classList.add("hidden");
            }, 200);
        },
    });

    if (renderFunction === undefined) {
        return {
            Tooltip: () => <></>,
            getMouseEventProperties: () => ({}),
        };
    }

    const Tooltip = (): JSX.Element => (
        <div
            ref={tooltipReference}
            data-testid="TooltipContainer"
            className="absolute z-10 hidden opacity-0 transition-opacity duration-200"
        >
            {tooltipDataPoint !== null && renderFunction(tooltipDataPoint)}
        </div>
    );

    return { Tooltip, getMouseEventProperties };
};

export { useGraphTooltip };
