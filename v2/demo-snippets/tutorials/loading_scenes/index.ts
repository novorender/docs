/** Here goes  code demo code that you can see in the playground */
import publicScene from "./public_scene.ts?raw";
import privateScene from "./private_scene.ts?raw";

import { IDemoContext, IDemoHost, IModule, demo } from "../../config";
import { RenderStateChanges, View } from "@novorender/api";

/**
 * Add any boilerplate code here in this class that will work
 * behind the scenes and is not related to the objective of demo
 * e.g. you can create context or view here that doesn't need to
 * be in the demo
 * @notes host class must implement `IDemoHost<T>`
 */
class RenderStateDemoHost implements IDemoHost<IModule<RenderStateChanges, View>> {
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

export const loadingScenes = {
  ...demo("loading_scenes", "public_scene", publicScene, RenderStateDemoHost, {}, "Loading public scenes."),
  ...demo("loading_scenes", "private_scene", privateScene, RenderStateDemoHost, {}, "Loading private   scenes."),
};
