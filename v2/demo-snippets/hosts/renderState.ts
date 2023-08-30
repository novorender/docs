import { IDemoContext, IDemoHost, IModule } from "../demo";
import { RenderStateChanges, View } from "@novorender/api";

type Args = [];
type Ret = RenderStateChanges | Promise<RenderStateChanges>;
type Module = IModule<Ret, Args>;

export class RenderStateDemoHost implements IDemoHost<Module> {
  private readonly _view: View;

  constructor(readonly context: IDemoContext) {
    const {
      canvasElements: { primaryCanvas: canvas },
      deviceProfile,
      imports,
    } = this.context;
    this._view = new View(canvas, deviceProfile, imports);
  }

  async run(): Promise<void> {
    await this._view.run();
    this._view.dispose();
  }

  async updateModule(module: Module): Promise<readonly Error[]> {
    // TODO: verify module shape first
    const stateChanges = await module.main();
    const errors = this._view.validateRenderState(stateChanges);
    if (errors.length == 0) {
      console.log(stateChanges);
      this._view.modifyRenderState(stateChanges);
    }
    return errors;
  }

  exit(): void {
    this._view?.exit();
  }
}
