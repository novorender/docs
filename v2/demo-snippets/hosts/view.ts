import { IDemoContext, IDemoHost, IModule } from "../demo";
import { RenderStateChanges, View } from "@novorender/api";

type Args = [View];
type Ret = RenderStateChanges | undefined;
type Module = IModule<Ret, Args>;

export class ViewDemoHost implements IDemoHost<Module> {
  private _module: Module | undefined;
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

    let prev_module: typeof this._module | undefined;

    view.animate = async () => {
      try {
        if (prev_module !== this._module) {
          prev_module = this._module;
          const stateChanges = await prev_module?.main(view);
          if (stateChanges) {
            view.modifyRenderState(stateChanges);
          }
        }
      } catch (error) {
        console.log("error while running module ", error);
      }
    };

    await view.run();
    view.dispose();
  }

  updateModule(module: Module) {
    this._module = module;
  }

  exit(): void {
    this._view?.exit();
  }
}