import { createAPI, type SceneData, type API } from "@novorender/data-js-api";
import { View } from "@novorender/api";
import { IDemoHost, IModule } from "../demo";
import { BaseDemoHost } from "./base";

type Args = [View, SceneData];
type Ret = void;
type Module = IModule<Ret, Args>;

export class SearchDemoHost extends BaseDemoHost implements IDemoHost<Module> {
    sceneData!: SceneData;

    async init() {
        // Initialize the data API with the Novorender data server service
        const dataAPI = createAPI({
            serviceUrl: "https://data.novorender.com/api",
        });
        let moduleError;
        try {
            // Load scene metadata
            // Condos scene ID, but can be changed to any public scene ID
            const sceneData = await dataAPI.loadScene("95a89d20dd084d9486e383e131242c4c");
            this.sceneData = sceneData as SceneData;
            // Destructure relevant properties into variables
            const { url } = this.sceneData;
            // load the scene using URL gotten from `sceneData`
            this.loadScene(url);
        } catch (error) {
            moduleError = error;
        } finally {
            this.context.reportErrors(moduleError);
        }
    }

    async updateModule(module: Module) {
        let moduleError;
        try {
            // TODO: verify module shape first
            await module.main(this.view, this.sceneData);
        } catch (error) {
            moduleError = error;
        } finally {
            this.context.reportErrors(moduleError);

        }
    }
}
