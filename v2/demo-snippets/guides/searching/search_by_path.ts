import { createNeutralHighlight, type RenderStateHighlightGroups, type View } from "@novorender/api";
import { type SceneData } from "@novorender/data-js-api";

export async function main(view: View, sceneData: SceneData) {
	try {
		const { db } = sceneData;
		if (db) {
			const controller = new AbortController();
			const signal = controller.signal;

			// Run the searches
			// Path is similar to filesystem file/folder hierarchical paths, e.g. my_folder/my_object
			// Paths reflect original CAD model hierarchy (.ifc, .rvm, etc)
			// This will find all objects on the 2nd floor
			const iterator = db.search(
				{
					parentPath: "Farger.IFC/3/Surface:2481563/Apartment with 12 condos/2ND FLOOR",
				},
				signal
			);

			// In this example we just want to isolate the objects so all we need is the object ID
			const result: number[] = [];
			for await (const object of iterator) {
				result.push(object.id);
			}

			// Then we isolate the objects found
			const renderStateHighlightGroups: RenderStateHighlightGroups = {
				defaultAction: "hide",
				groups: [{ action: createNeutralHighlight(), objectIds: result }],
			};

			// Finally, modify the renderState
			view.modifyRenderState({ highlights: renderStateHighlightGroups });
		}
	} catch (e) {
		console.warn(e);
	}
}
