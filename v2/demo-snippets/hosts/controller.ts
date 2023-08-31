import { IDemoContext, IDemoHost, IModule } from "../demo";
import { View, OrbitController } from "@novorender/api";
import { BaseDemoHost } from "./base";

type Args = [controller: OrbitController];
type Ret = void;
type Module = IModule<Ret, Args>;

export class ControllerDemoHost extends BaseDemoHost implements IDemoHost<Module> {
  constructor(context: IDemoContext) {
    super(context);
    this.view.modifyRenderState({ grid: { enabled: true } });
  }

  updateModule(module: Module) {
    const { activeController } = this.view;
    try {
      OrbitController.assert(activeController);
      module.main(activeController);
    } catch (error) {
      this.context.reportErrors(error);
    }
  }
}
