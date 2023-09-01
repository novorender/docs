import { IDemoHost, IModule } from "../demo";
import { RenderStateChanges } from "@novorender/api";
import { BaseDemoHost } from "./base";

type Args = [];
type Ret = RenderStateChanges | Promise<RenderStateChanges>;
type Module = IModule<Ret, Args>;

export class StateDemoHost extends BaseDemoHost implements IDemoHost<Module> {
  async updateModule(module: Module) {
    // TODO: verify module shape first
    const stateChanges = await module.main();
    this.modifyRenderState(stateChanges);
  }
}
