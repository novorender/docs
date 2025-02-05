import { SceneData, createAPI } from "@novorender/data-js-api";
import { ViewDemoHost } from "./view";

export class ViewCondosDemoHost extends ViewDemoHost {
    async init(): Promise<void> {
        // Initialize the data API with the Novorender data server service
        const dataApi = createAPI({
            serviceUrl: "https://data-v2.novorender.com",
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
        await this.loadScene(
            url,
            parentSceneId,
            "index.json"
        );
    }
}
