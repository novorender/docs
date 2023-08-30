import { type RecursivePartial, type RenderStateClipping, ClippingMode } from "@novorender/api";

export function main(centerX: number, centerY: number, centerZ: number): RecursivePartial<RenderStateClipping> {
  return {
    enabled: true,
    mode: ClippingMode.union,
    planes: [
      { normalOffset: [-1, 0, 0, -(centerX - 5)] }, // left plane
      { normalOffset: [1, 0, 0, centerX + 5] }, // right plane
      { normalOffset: [0, -1, 0, -(centerY + 0)] }, // bottom plane
      { normalOffset: [0, 1, 0, centerY + 5] }, // top plane
      { normalOffset: [0, 0, -1, -(centerZ - 5)] }, // front plane
      { normalOffset: [0, 0, 1, centerZ + 5] }, // back plane
    ],
  };
}
