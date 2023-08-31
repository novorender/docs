import { createAPI, type SceneData } from "@novorender/data-js-api";
import { View } from "@novorender/api";
import { IDemoContext, IDemoHost, IModule } from "../demo";

type Args = [View: View, canvas: HTMLCanvasElement];
type Ret = void;
type Module = IModule<Ret, Args>;

export class MeasureDemoHost implements IDemoHost<Module> {
  private readonly view: View;
  private sceneData!: SceneData;

  constructor(readonly context: IDemoContext) {
    const {
      canvasElements: { primaryCanvas: canvas },
      deviceProfile,
      imports,
    } = this.context;
    this.view = new View(canvas, deviceProfile, imports);
  }

  async run(): Promise<void> {
    const { view } = this;
    await this.loadScene();
    await view.run();
    view.dispose();
  }

  async loadScene() {
    const { view } = this;

    // Initialize the data API with the Novorender data server service
    const dataApi = createAPI({
      serviceUrl: "https://data.novorender.com/api",
    });

    try {
      // Load scene metadata
      // Condos scene ID, but can be changed to any public scene ID
      const sceneData = await dataApi.loadScene("95a89d20dd084d9486e383e131242c4c");

      console.log("sceneData ", sceneData);

      this.sceneData = sceneData as SceneData;

      // Destructure relevant properties into variables
      const { url, db } = sceneData as SceneData;
      // load the scene using URL gotten from `sceneData`
      const config = await view.loadSceneFromURL(new URL(url));
      const { center, radius } = config.boundingSphere;
      view.activeController.autoFit(center, radius);
    } catch (error) {
      console.log("Error while loading scene from URL ", error);
    }
  }

  updateModule(module: Module) {
    // TODO: verify module shape first
    module.main(this.view, this.context.canvasElements.primaryCanvas);
  }

  exit(): void {
    this.view?.exit();
  }
}
