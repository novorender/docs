import { IDemoHost, IModule } from "../demo";
import { RecursivePartial, RenderStateClipping, View } from "@novorender/api";
import { vec3 } from "gl-matrix";
import { BaseDemoHost } from "./base";
import { SceneData, createAPI } from "@novorender/data-js-api";

type Args = [centerX: number, centerY: number, centerZ: number, (View | undefined)?];
type Ret = RecursivePartial<RenderStateClipping> | undefined;
type Module = IModule<Ret, Args>;

export class ClippingDemoHost extends BaseDemoHost implements IDemoHost<Module> {
    readonly center = vec3.create();

    async init() {
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
        await this.loadScene(url, parentSceneId);
    }

    async updateModule(module: Module) {
        // TODO: verify module shape first
        const [cx, cy, cz] = this.center;
        const stateChanges = { clipping: module.main(cx, cy, cz, this.view), outlines: { enabled: true } };
        this.modifyRenderState(stateChanges);
    }
}
