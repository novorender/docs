import { IDemoContext, IDemoHost, IModule } from "../demo";
import { demo } from "../demo/demo";
import { RenderStateChanges, View } from "@novorender/api";

type Args = [];
type Ret = RenderStateChanges | undefined;
type Module = IModule<Ret, Args>;

export class RenderStateDemoHost implements IDemoHost<Module> {
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
    // const envs = await view.availableEnvironments("https://api.novorender.com/assets/env/index.json");
    // const env = envs[0];

    // view.modifyRenderState({ background: { url: env.url, blur: 0.2 } });

    this._view = view;

    let prev_module = this._module;

    view.animate = () => {
      try {
        if (prev_module !== this._module) {
          prev_module = this._module;
          const stateChanges = prev_module?.main();
          if (stateChanges) {
            view.modifyRenderState(stateChanges);
          }
        }
      } catch (error) {}
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
