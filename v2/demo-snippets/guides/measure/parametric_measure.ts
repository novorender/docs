import { View, type MeasureEntity } from "@novorender/api";

export async function main(view: View) {
	const measureView = await view.measure;

	// Parametric entities used to measure between
	let measureEntity1: MeasureEntity | undefined = undefined;
	let measureEntity2: MeasureEntity | undefined = undefined;

	// number to alternate between selected entities.
	let selectEntity: 1 | 2 = 1;

	view.canvas.onclick = async (e: MouseEvent) => {
		const result = await view.pick(e.offsetX, e.offsetY);
		if (result) {
			const { objectId, position } = result;
			if (selectEntity === 1) {
				// Find measure entity at pick location
				measureEntity1 = (await measureView.core.pickMeasureEntity(objectId, position)).entity;
				selectEntity = 2;
			} else {
				// Find measure entity at pick location
				measureEntity2 = (await measureView.core.pickMeasureEntity(objectId, position)).entity;
				selectEntity = 1;
			}
			// As long as one object is selected log out the values
			// Note that if measureEntity2 is undefined then the result will be the parametric values of measureEntity1
			if (measureEntity1) {
				const _log = await measureView.core.measure(measureEntity1, measureEntity2);
				openInfoPane(_log);
			}
		}
	};
}
