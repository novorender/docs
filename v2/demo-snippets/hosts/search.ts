import { createAPI, type SceneData, type API } from "@novorender/data-js-api";
import { View } from "@novorender/api";
import { IDemoHost, IModule } from "../demo";
import { BaseDemoHost } from "./base";

type Args = [View: View, sceneData: SceneData, dataApi?: API];
type Ret = void;
type Module = IModule<Ret, Args>;

export class SearchDemoHost extends BaseDemoHost implements IDemoHost<Module> {
    sceneData!: SceneData;
    dataAPI!: API;

    async init() {
        const { view } = this;
        // Initialize the data API with the Novorender data server service
        this.dataAPI = createAPI({
            serviceUrl: "https://data.novorender.com/api",
        });

        try {
            // Load scene metadata
            // Condos scene ID, but can be changed to any public scene ID
            const sceneData = await this.dataAPI.loadScene("c132d3eecf4f4247ace112410f4219aa");

            console.log("sceneData ", sceneData);

            this.sceneData = sceneData as SceneData;

            // Destructure relevant properties into variables
            const { url, db } = sceneData as SceneData;
            // load the scene using URL gotten from `sceneData`
            const config = await view.loadSceneFromURL(new URL(url));
            const { center, radius } = config.boundingSphere;
            view.activeController.autoFit(center, radius);
        } catch (error) {
            this.context.reportErrors([error as Error]);
        }
        this.context.reportErrors([]);
    }

    updateModule(module: Module) {
        // TODO: verify module shape first
        try {
            module.main(this.view, this.sceneData, this.dataAPI);
        } catch (error) {
            this.context.reportErrors(error);
        }
    }
}
