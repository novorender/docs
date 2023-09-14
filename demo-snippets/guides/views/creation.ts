import { getDeviceProfile, View, type GPUTier, type ViewImports } from "@novorender/api";

export async function main(canvas: HTMLCanvasElement, _: unknown, imports: ViewImports) {
    const gpuTier: GPUTier = 2;
    const deviceProfile = getDeviceProfile(gpuTier);
    const view = new View(canvas, deviceProfile, imports);
    view.modifyRenderState({ grid: { enabled: true } });
    const abortController = new AbortController();
    setTimeout(() => { abortController.abort(); }, 5_000); // exit after 5 seconds.
    await view.run(abortController.signal);
    view.dispose();
    alert("View disposed!");
}
