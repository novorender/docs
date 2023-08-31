import { IDemoContext, IDemoHost, IModule } from "../demo";
import { RenderStateChanges, View } from "@novorender/api";

interface Module {
  init(view: View): Promise<void> | void;
  update(time: number): RenderStateChanges;
}

export class RenderStateAnimationDemoHost implements IDemoHost<Module> {
  private readonly view: View;
  private module: Module | undefined;

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
    view.animate = (time) => {
      try {
        const stateChanges = this.module?.update(time);
        if (stateChanges) {
          view.modifyRenderState(stateChanges);
        }
      } catch (error) {
        // TODO: We need a way to report errors from here.
      }
    };
    await view.run();
    view.dispose();
  }

  async updateModule(module: Module) {
    // TODO: verify module shape first
    await module.init(this.view);
  }

  exit(): void {
    this.view?.exit();
  }
}
