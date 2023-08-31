import { isTruthy } from "./is-truthy";

export const isUnit = (): boolean => {
    if (!isTruthy(process.env.REACT_APP_IS_UNIT)) {
        return false;
    }

    return ["true", "1"].includes(process.env.REACT_APP_IS_UNIT.toLowerCase());
};
