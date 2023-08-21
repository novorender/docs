import { IDemoContext, IDemoHost, IModule } from "../demo";
import { RenderStateChanges, View } from "@novorender/api";

/**
 * Add any boilerplate code here in this class that will work
 * behind the scenes and is not related to the objective of demo
 * e.g. you can create context or view here that doesn't need to
 * be in the demo
 * @notes host class must implement `IDemoHost<T>`
 */
export class ViewDemoHost implements IDemoHost<IModule<RenderStateChanges, View>> {
  private _module: IModule<RenderStateChanges, View> | undefined;
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

    let prev_module = this._module;

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

  updateModule(module: IModule<RenderStateChanges, View>): string | undefined {
    this._module = module;
    return "test";
  }

  exit(): void {
    this._view?.exit();
  }
}
