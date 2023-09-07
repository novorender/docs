import { type RecursivePartial, type RenderStateClipping } from "@novorender/api";

export function main(centerX: number, centerY: number, centerZ: number): RecursivePartial<RenderStateClipping> {
    return {
        enabled: true,
        planes: [{ normalOffset: [-1, -0, -0, -centerX] }],
    };
}
