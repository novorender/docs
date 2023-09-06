import { createAPI, type SceneData, type API } from "@novorender/data-js-api";
import { View } from "@novorender/api";
import { IDemoHost, IModule } from "../demo";
import { BaseDemoHost } from "./base";

type Args = [View, SceneData, API];
type Ret = void;
type Module = IModule<Ret, Args>;

export class ObjectGroupsDemoHost extends BaseDemoHost implements IDemoHost<Module> {
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
            // NOTE: don't change this scene ID, its a special variant of condos with predefined groups for each floor
            const sceneData = await this.dataAPI.loadScene("c132d3eecf4f4247ace112410f4219aa");
            this.sceneData = sceneData as SceneData;
            // Destructure relevant properties into variables
            const { url } = this.sceneData;
            // load the scene using URL gotten from `sceneData`
            this.loadScene(url);
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
