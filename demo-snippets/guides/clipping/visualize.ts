import { type RecursivePartial, type RenderStateClipping, ClippingMode } from "@novorender/api";

export function main(centerX: number, centerY: number, centerZ: number): RecursivePartial<RenderStateClipping> {
    // Set samplesMSAA larger than 1 for the planes to have transparency
    // view.modifyRenderState({ output: { samplesMSAA: 2 } });

    return {
        enabled: true,
        draw: true,
        mode: ClippingMode.intersection,
        planes: [
            { normalOffset: [1, 0, 0, centerX], color: [1, 0, 0, 0.5] },
            { normalOffset: [0, -1, 0, -centerY], color: [0, 1, 0, 0.5] },
            { normalOffset: [0, 0, -1, -centerZ], color: [0, 0, 1, 0.5] },
        ],
    };
}
