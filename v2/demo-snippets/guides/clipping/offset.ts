import { type RecursivePartial, type RenderStateClipping } from "@novorender/api";

export function main(centerX: number, centerY: number, centerZ: number): RecursivePartial<RenderStateClipping> {
  const offset = 5;
  return {
    enabled: true,
    planes: [{ normalOffset: [1, 0, 0, centerX + offset] }],
  };
}
