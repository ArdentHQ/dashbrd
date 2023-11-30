const formatNumbershort = (number_: number): string => {
    if (number_ < 1000) {
        return number_.toString();
    } else if (number_ === 1000) {
        return "1k";
    } else if (number_ < 1000000) {
        return (number_ / 1000).toFixed(1) + "k";
    } else {
        return (number_ / 1000000).toFixed(1) + "m";
    }
};

export { formatNumbershort };
