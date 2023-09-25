import * as reactInViewport from "react-in-viewport";
import { isTruthy } from "@/Utils/is-truthy";

// Used  in `Image.tsx` to mock lazy-loading of images.
export const mockViewportVisibilitySensor = (properties?: { inViewport?: boolean; onEnterViewport?: () => void }) => {
    //@ts-ignore
    vi.spyOn(reactInViewport, "useInViewport").mockImplementation((element, _, __, options) => {
        if (isTruthy(properties?.inViewport)) {
            options?.onEnterViewport?.();
        }

        return {
            inViewport: properties?.inViewport ?? true,
        };
    });
};
