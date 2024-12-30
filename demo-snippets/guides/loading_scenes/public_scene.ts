import { createAPI, type SceneData } from "@novorender/data-js-api";
import type { View } from "@novorender/api";

export async function main(view: View): Promise<void> {
    // Initialize the data API with the Novorender data server service
    const dataApi = createAPI({
        serviceUrl: "https://data-v2.novorender.com/api",
    });

    // Load scene metadata
    // Condos scene ID, but can be changed to any public scene ID
    const sceneData = await dataApi.loadScene("3b5e65560dc4422da5c7c3f827b6a77c");
    // Destructure relevant properties into variables
    const { url: _url } = sceneData as SceneData;
    const url = new URL(_url);
    const parentSceneId = url.pathname.replaceAll("/", "");
    url.pathname = "";
    // load the scene using URL gotten from `sceneData`
    const config = await view.loadScene(
        url,
        parentSceneId,
        "index.json"
    );
    const { center, radius } = config.boundingSphere;
    view.activeController.autoFit(center, radius);
}
