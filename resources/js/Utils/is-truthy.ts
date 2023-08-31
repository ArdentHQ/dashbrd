export const isTruthy = <T>(value: T | undefined | null): value is T => {
    if (value === undefined || value === null) {
        return false;
    }

    if (typeof value === "number") {
        return value !== 0;
    }

    if (typeof value === "string") {
        return value.trim().length > 0;
    }

    if (typeof value === "boolean") {
        return value;
    }

    // If we get here, we have an object, array, or function (which is truthy)
    return true;
};
