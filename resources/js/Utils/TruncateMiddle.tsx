interface Properties {
    text?: string;
    length: number;
    separator?: string;
}

export const TruncateMiddle = ({ text, length, separator = "…" }: Properties): JSX.Element => {
    if (text === undefined) {
        return <></>;
    }

    if (text.length <= length) {
        return <>{text}</>;
    }

    const partLength = Math.floor(length / 2);

    return (
        <>
            {[text.slice(0, Math.max(0, partLength)), text.slice(Math.max(0, text.length - partLength))].join(
                separator,
            )}
        </>
    );
};
