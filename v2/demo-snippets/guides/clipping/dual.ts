import { type RecursivePartial, type RenderStateClipping, ClippingMode } from "@novorender/api";

export function main(centerX: number, centerY: number, centerZ: number): RecursivePartial<RenderStateClipping> {
	return {
		enabled: true,
		mode: ClippingMode.union,
		planes: [{ normalOffset: [1, 0, 0, centerX] }, { normalOffset: [-0, -0, -1, -centerZ] }],
	};
}
