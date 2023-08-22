import { View, type DeviceProfile, type Core3DImports } from "@novorender/api";

export async function main(canvas: HTMLCanvasElement, deviceProfile: DeviceProfile, imports: Core3DImports, signal: AbortSignal) {
  const view = new View(canvas, deviceProfile, imports);
  view.modifyRenderState({ grid: { enabled: true } });
  await view.run(signal);
}
