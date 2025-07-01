import { createAPI, type SceneData, type API } from "@novorender/data-js-api";
import { RenderStateChanges, View } from "@novorender/api";
import { IDemoHost, IModule } from "../demo";
import { BaseDemoHost } from "./base";

type Args = [View, SceneData, API];
type Ret = Promise<RenderStateChanges>;
type Module = IModule<Ret, Args>;

export class ModelPreviewDemoHost extends BaseDemoHost implements IDemoHost<Module> {
    sceneData!: SceneData;
    dataAPI!: API;

    async init() {
        // Initialize the data API with the Novorender data server service
        this.dataAPI = createAPI({
            serviceUrl: "https://data-v2.novorender.com/api",
        });
        let moduleError;

        try {
            // Load scene metadata
            // Condos scene ID, but can be changed to any public scene ID
            const sceneData = await this.dataAPI.loadScene("95a89d20dd084d9486e383e131242c4c");
            this.sceneData = sceneData as SceneData;
            // Destructure relevant properties into variables
            const { url: _url } = sceneData as SceneData;
            const url = new URL(_url);
            const parentSceneId = url.pathname.replaceAll("/", "");
            url.pathname = "";
            await this.loadScene(url, parentSceneId);
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
            const stateChanges = await module.main(this.view, this.sceneData, this.dataAPI);
            this.modifyRenderState(stateChanges);
        } catch (error) {
            moduleError = error;
        } finally {
            this.context.reportErrors(moduleError);

        }
    }
}
