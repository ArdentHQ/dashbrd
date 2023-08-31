import React from "react";

interface GraphAnimation {
    attribute: string;
    from: number | string;
    to: number | string;
}

interface GraphHoverAnimationProperties {
    animations: GraphAnimation[];
    targetElementId?: string; // must not contain dashes
}

const GraphHoverAnimation = ({ animations, targetElementId }: GraphHoverAnimationProperties): JSX.Element => (
    <>
        {animations.map(({ attribute, from, to }, index) => (
            <React.Fragment key={index}>
                <animate
                    attributeName={attribute}
                    from={from}
                    to={to}
                    dur="0.1s"
                    begin={[targetElementId, "mouseover"].filter(Boolean).join(".")}
                    fill="freeze"
                />
                <animate
                    attributeName={attribute}
                    from={to}
                    to={from}
                    dur="0.15s"
                    begin={[targetElementId, "mouseleave"].filter(Boolean).join(".")}
                    fill="freeze"
                />
            </React.Fragment>
        ))}
    </>
);

export type { GraphAnimation };
export { GraphHoverAnimation };
