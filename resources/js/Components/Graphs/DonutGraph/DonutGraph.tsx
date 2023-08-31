import { GraphHoverAnimation } from "@/Components/Graphs/GraphHoverAnimation";
import { type GraphDataPoint } from "@/Components/Graphs/Graphs.contracts";
import { useDonutGraph } from "@/Components/Graphs/Hooks/DonutGraph/useDonutGraph";
import { useGraphTooltip } from "@/Components/Graphs/Hooks/useGraphTooltip";

interface DonutGraphProperties {
    data: GraphDataPoint[];
    size: number;
    renderTooltip?: (dataPoint: GraphDataPoint) => JSX.Element;
    children?: JSX.Element;
}

export const DonutGraph = ({ data, size, renderTooltip, children }: DonutGraphProperties): JSX.Element => {
    const { Tooltip, getMouseEventProperties } = useGraphTooltip(renderTooltip, "donut");
    const { circles, backgroundCircle } = useDonutGraph(data, size);

    const renderCircles = (): JSX.Element[] =>
        circles.map(({ circleProperties, animations }, index) => (
            <g
                key={index}
                data-testid="DonutGraph__item"
            >
                <circle
                    {...circleProperties}
                    id={`circleTrackLine__${index}`}
                    data-testid="DonutGraph__item-track-line"
                    className="stroke-theme-secondary-300"
                    strokeWidth={2}
                    pointerEvents="none"
                />
                <circle
                    {...circleProperties}
                    id={`circleHoverArea__${index}`}
                    data-testid="DonutGraph__item-hover-area"
                    strokeWidth={30}
                    opacity={0}
                    pointerEvents="visibleStroke"
                    {...getMouseEventProperties(data[index])}
                />
                <circle
                    {...circleProperties}
                    pointerEvents="none"
                >
                    <GraphHoverAnimation
                        targetElementId={`circleHoverArea__${index}`}
                        animations={animations}
                    />
                </circle>
            </g>
        ));

    return (
        <div className="relative inline-block">
            <Tooltip />

            {children != null && (
                <div className="pointer-events-none absolute flex h-full w-full items-center justify-center">
                    {children}
                </div>
            )}

            <svg
                width={size}
                height={size}
                data-testid="DonutGraph__svg"
                className="fill-theme-secondary-100"
            >
                <>
                    <circle {...backgroundCircle} />

                    {renderCircles()}
                </>
            </svg>
        </div>
    );
};
