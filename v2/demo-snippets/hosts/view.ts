import { IDemoHost, IModule } from "../demo";
import { View } from "@novorender/api";
import { BaseDemoHost } from "./base";

type Args = [View, (HTMLCanvasElement | undefined)?];
type Ret = void;
type Module = IModule<Ret, Args>;

export class ViewDemoHost extends BaseDemoHost implements IDemoHost<Module> {
    updateModule(module: Module) {
        const {
            canvasElements: { canvas2D },
        } = this.context;
        module.main(this.view, canvas2D);
    }
}
