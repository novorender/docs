import { IDemoContext, IDemoHost, IModule } from "../demo";
import { type RecursivePartial, type RenderStateHighlightGroups, View } from "@novorender/api";

type Args = [canvas: HTMLCanvasElement, view: View, callback: (stateChanges: RecursivePartial<RenderStateHighlightGroups> | undefined) => void];
type Ret = RecursivePartial<RenderStateHighlightGroups> | undefined;
type Module = IModule<Ret, Args>;

export class PickDemoHost implements IDemoHost<Module> {
  private _view: View | undefined;

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
    const { center, radius } = config.boundingSphere;
    view.activeController.autoFit(center, radius);
  }

  updateModule(module: Module): readonly Error[] | void {
    // TODO: verify module shape first
    module.main(this.context.canvasElements.primaryCanvas, this._view as View, (stateChanges) => {
      if (this._view && stateChanges) {
        const errors = this._view.validateRenderState({ highlights: stateChanges });
        if (errors.length > 0) {
          return errors;
        }
        this._view.modifyRenderState({ highlights: stateChanges });
      }
    });
  }

  exit(): void {
    this._view?.exit();
  }
}
