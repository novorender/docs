import { type RecursivePartial, type RenderStateClipping } from "@novorender/api";

export function main(centerX: number, centerY: number, centerZ: number): RecursivePartial<RenderStateClipping> {
  // compute plane normal
  const angle = (-45 / 180) * Math.PI; // -45 deg rotation angle as radians
  const nx = Math.cos(angle);
  const ny = 0;
  const nz = Math.sin(angle);

  // compute plane offset
  const o = centerX * nx + centerY * ny + centerZ * nz;

  return {
    enabled: true,
    planes: [{ normalOffset: [nx, ny, nz, o] }],
  };
}
