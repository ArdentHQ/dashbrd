const formatPercentage = (value: number): string => `${Math.round((value + Number.EPSILON) * 10) / 10}%`;

export { formatPercentage };
