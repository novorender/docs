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
        // Initialize the data API with the Novorender data server service
        this.dataAPI = createAPI({
            serviceUrl: "https://data.novorender.com/api",
        });
        let moduleError;

        try {
            // Load scene metadata
            // Condos scene ID, but can be changed to any public scene ID
            // NOTE: don't change this scene ID, its a special variant of condos with predefined groups for each floor
            const sceneData = await this.dataAPI.loadScene("c132d3eecf4f4247ace112410f4219aa");
            this.sceneData = sceneData as SceneData;
            // Destructure relevant properties into variables
            const { url } = this.sceneData;
            // load the scene using URL gotten from `sceneData`
            await this.loadScene(url);
        } catch (error) {
            moduleError = error;
        } finally {
            this.context.reportErrors([]);
        }
    }

    async updateModule(module: Module) {
        let moduleError;
        try {
            // TODO: verify module shape first
            module.main(this.view, this.sceneData, this.dataAPI);
        } catch (error) {
            moduleError = error;
        } finally {
            this.context.reportErrors(moduleError);

        }
    }
}
