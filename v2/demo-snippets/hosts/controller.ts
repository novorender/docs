import { IDemoContext, IDemoHost, IModule } from "../demo";
import { View, OrbitController } from "@novorender/api";

type Args = [controller: OrbitController];
type Ret = void;
type Module = IModule<Ret, Args>;

export class ControllerDemoHost implements IDemoHost<Module> {
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
    view.modifyRenderState({ grid: { enabled: true } });
    const { activeController } = view;
    // activeController["changed"]();
    OrbitController.assert(activeController);

    this._view = view;

    let prev_module: Module | undefined;

    view.animate = () => {
      try {
        if (prev_module !== this._module) {
          prev_module = this._module;
          prev_module?.main(activeController);
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
