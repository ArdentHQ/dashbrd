import { useRef } from "react";

/**
 * @see https://github.com/juliencrn/usehooks-ts/blob/master/packages/usehooks-ts/src/useIsFirstRender/useIsFirstRender.ts
 */
export const useIsFirstRender = (): boolean => {
    const isFirst = useRef(true);

    if (isFirst.current) {
        isFirst.current = false;

        return true;
    }

    return isFirst.current;
};
