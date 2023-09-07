import { type RecursivePartial, type RenderStateClipping, ClippingMode } from "@novorender/api";

export function main(centerX: number, centerY: number, centerZ: number): RecursivePartial<RenderStateClipping> {
    return {
        enabled: true,
        mode: ClippingMode.intersection,
        planes: [{ normalOffset: [0, 1, 0, centerY] }, { normalOffset: [0, -1, 0, -(centerY + 4)] }],
    };
}
