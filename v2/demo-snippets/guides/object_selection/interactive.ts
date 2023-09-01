import { createColorSetHighlight, type View } from "@novorender/api";

export function main(view: View) {
	const limeGreen = createColorSetHighlight([0, 1, 0]);

	view.canvas.onclick = async (e: MouseEvent) => {
		const result = await view.pick(e.offsetX, e.offsetY);
		const objectIds: number[] = [];
		if (result) {
			// Add selected object to highlight group
			objectIds.push(result.objectId);
		}
		view.modifyRenderState({
			highlights: {
				groups: [{ action: limeGreen, objectIds }],
			},
		});
	};
}
