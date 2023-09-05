import { createColorSetHighlight, type View } from "@novorender/api";
import type { SceneData } from "@novorender/data-js-api";
import type { ObjectData } from "@novorender/webgl-api";

export async function main(view: View, sceneData: SceneData) {
    const { db } = sceneData;

    if (db) {
        const controller = new AbortController();
        const signal = controller.signal;
        const iterator = db.search(
            {
                searchPattern: "Roof",
                // `true` so that metadata is preloaded
                full: true,
            },
            signal
        );

        const searchResult: ObjectData[] = [];

        // Use the first 5 results to keep the properties in the property box relatively short
        for (let i = 0; i < 5; i++) {
            const iteratorResult = await iterator.next();
            if (iteratorResult.done) {
                break;
            }
            // Because we have set the search option "full: true"
            // .loadMetadata() will not result in any more requests being made
            // Try flipping it to false and see the difference in the network request log
            const objectWithMetadata = await iteratorResult.value.loadMetaData();
            searchResult.push(objectWithMetadata);
        }

        // Highlight results
        highlightObjects(
            view,
            searchResult.map((object) => object.id)
        );

        // Display metadata
        openInfoPane(searchResult);
    }
}

function highlightObjects(view: View, objectIds: number[]): void {
    const highlight = createColorSetHighlight([0, 1, 0]);
    const renderState = {
        highlights: {
            groups: [{ action: highlight, objectIds }],
        },
    };
    view.modifyRenderState(renderState);
}
