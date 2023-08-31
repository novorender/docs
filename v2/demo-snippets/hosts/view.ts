import { IDemoHost, IModule } from "../demo";
import { View } from "@novorender/api";
import { BaseDemoHost } from "./base";

type Args = [View];
type Ret = void;
type Module = IModule<Ret, Args>;

export class ViewDemoHost extends BaseDemoHost implements IDemoHost<Module> {
  updateModule(module: Module) {
    module.main(this.view);
  }
}
