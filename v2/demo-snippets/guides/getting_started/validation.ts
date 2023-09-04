import type { RenderStateChanges } from "@novorender/api";

export function main(): RenderStateChanges {
    return {
        grid: {
            enabled: true,
            distance: -100, // distance must be a positive number
        },
    };
}
