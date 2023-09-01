import { createNeutralHighlight, type RenderStateHighlightGroups, type View } from "@novorender/api";
import { type SceneData } from "@novorender/data-js-api";

export async function main(view: View, sceneData: SceneData) {
	try {
		const { db } = sceneData;
		if (db) {
			const controller = new AbortController();
			const signal = controller.signal;

			// Run the searches
			// Fluffy search which will search all properties for words starting with "Roof"
			// "Roo" will still find roofs, but "oof" will not
			const iterator = db.search({ searchPattern: "Roof" }, signal);

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
