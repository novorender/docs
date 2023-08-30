import { IDemoContext, IDemoHost, IModule } from "../demo";
import { RecursivePartial, RenderStateClipping, View } from "@novorender/api";
import { vec3, ReadonlyVec3 } from "gl-matrix";

type Args = [centerX: number, centerY: number, centerZ: number];
type Ret = RecursivePartial<RenderStateClipping> | undefined;
type Module = IModule<Ret, Args>;

export class ClippingDemoHost implements IDemoHost<Module> {
  private _view: View | undefined;
  private _center: ReadonlyVec3 = vec3.create();

  constructor(readonly context: IDemoContext) {}

  async run(): Promise<void> {
    const {
      canvasElements: { primaryCanvas: canvas },
      deviceProfile,
      imports,
    } = this.context;
    const view = new View(canvas, deviceProfile, imports);
    this._view = view;
    await this.loadScene("https://api.novorender.com/assets/scenes/18f56c98c1e748feb8369a6d32fde9ef/");
    await view.run();
    view.dispose();
  }

  async loadScene(url: string) {
    const view = this._view!;
    const config = await view.loadSceneFromURL(new URL(url));
    // view.modifyRenderState({ scene: { url, config } });
    const { center, radius } = config.boundingSphere;
    view.activeController.autoFit(center, radius);
    const [cx, cy, cz] = config.center;
    this._center = vec3.fromValues(cx, -cz, cy);
  }

  updateModule(module: Module): readonly Error[] | void {
    // TODO: verify module shape first
    const [cx, cy, cz] = this._center;
    const stateChanges = module.main(cx, cy, cz);
    if (this._view) {
      const errors = this._view.validateRenderState({ clipping: stateChanges });
      if (errors.length > 0) {
        return errors;
      }
      this._view.modifyRenderState({ clipping: stateChanges });
    }
  }

  exit(): void {
    this._view?.exit();
  }
}
