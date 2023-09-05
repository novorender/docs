import type { View } from "@novorender/api";
import type { SceneData } from "@novorender/data-js-api";

export function main(view: View, sceneData: SceneData) {
    const { db } = sceneData;
    view.canvas.onclick = async (e: MouseEvent) => {
        // Query object and geometry information for given coordinates.
        const result = await view.pick(e.offsetX, e.offsetY);
        if (result) {
            // Load metadata
            const objectData = await db?.getObjectMetdata(result.objectId);
            // Display metadata
            openInfoPane(objectData);
        }
    };
}
