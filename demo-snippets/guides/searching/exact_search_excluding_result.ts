import { createNeutralHighlight, type RenderStateHighlightGroups, type View } from "@novorender/api";
import { type SceneData } from "@novorender/data-js-api";

export async function main(view: View, sceneData: SceneData) {
    try {
        const { db } = sceneData;
        if (db) {
            const controller = new AbortController();
            const signal = controller.signal;

            // Run the searches
            // Same as the exact search, but with exclude. This will return all object except the ones found above.
            const iterator = db.search(
                {
                    searchPattern: [{ property: "ifcClass", value: "ifcRoof", exact: true, exclude: true }],
                },
                signal,
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
