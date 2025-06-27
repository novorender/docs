import { View, type DeviceProfile } from "@novorender/api";

export async function main(
    canvas: HTMLCanvasElement,
    deviceProfile: DeviceProfile,
    signal: AbortSignal
) {
    const view = new View(canvas, deviceProfile);
    view.modifyRenderState({ grid: { enabled: true } });
    await view.run(signal);
    view.dispose();
}
