import { View, type DeviceProfile, type ViewImports } from "@novorender/api";

export async function main(canvas: HTMLCanvasElement, deviceProfile: DeviceProfile, imports: ViewImports, signal: AbortSignal) {
	const view = new View(canvas, deviceProfile, imports);
	view.modifyRenderState({ grid: { enabled: true } });
	await view.run(signal);
	view.dispose();
}
