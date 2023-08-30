import { IDemoContext, IDemoHost, IModule } from "../demo";
import { RecursivePartial, RenderStateClipping, View } from "@novorender/api";
import { vec3, ReadonlyVec3 } from "gl-matrix";

type Args = [centerX: number, centerY: number, centerZ: number];
type Ret = RecursivePartial<RenderStateClipping> | undefined;
type Module = IModule<Ret, Args>;

export class ClippingDemoHost implements IDemoHost<Module> {
  private readonly view: View;
  private readonly center = vec3.create();

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
    await this.loadScene("https://api.novorender.com/assets/scenes/18f56c98c1e748feb8369a6d32fde9ef/");
    await view.run();
    view.dispose();
  }

  async loadScene(url: string) {
    const { view } = this;
    const config = await view.loadSceneFromURL(new URL(url));
    // view.modifyRenderState({ scene: { url, config } });
    const { center, radius } = config.boundingSphere;
    view.activeController.autoFit(center, radius);
    const [cx, cy, cz] = config.center;
    vec3.set(this.center, cx, -cz, cy);
  }

  updateModule(module: Module): readonly Error[] {
    // TODO: verify module shape first
    const [cx, cy, cz] = this.center;
    const stateChanges = module.main(cx, cy, cz);
    const errors = this.view.validateRenderState({ clipping: stateChanges });
    this.view.modifyRenderState({ clipping: stateChanges });
    return errors;
  }

  exit(): void {
    this.view?.exit();
  }
}
