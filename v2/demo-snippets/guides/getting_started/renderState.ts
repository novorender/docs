import type { RenderStateChanges } from "@novorender/api";

export function main(): RenderStateChanges {
    return {
        grid: {
            enabled: true,
            color1: [0, 1, 1],
            color2: [1, 1, 0],
            size1: 1,
            size2: 5,
            distance: 100,
        },
        background: {
            color: [0, 0, 0.1, 1],
        },
        tonemapping: {
            exposure: -1,
        },
    };
}
