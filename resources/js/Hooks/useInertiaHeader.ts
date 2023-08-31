import { usePage } from "@inertiajs/react";

interface InertiaHeader {
    headers: {
        "X-Inertia": boolean;
        "X-Inertia-Version": string | null;
        "Content-Type": string;
    };
}

export const useInertiaHeader = (): InertiaHeader => {
    const { version } = usePage();
    let xInertia = true;

    if (version == null) {
        xInertia = false;
    }

    return {
        headers: {
            "X-Inertia": xInertia,
            "X-Inertia-Version": version,
            "Content-Type": "application/json",
        },
    };
};
