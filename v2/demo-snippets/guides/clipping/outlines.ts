import { type RecursivePartial, type RenderStateClipping } from "@novorender/api";

export function main(centerX: number, centerY: number, centerZ: number): RecursivePartial<RenderStateClipping> {
	return {
		enabled: true,
		planes: [
			{
				normalOffset: [0, -1, 0, -centerY],
				outline: { enabled: true, color: [0, 1, 1] },
			},
		],
	};
}
