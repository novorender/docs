import { IDemoHost, IModule } from "../demo";
import { View } from "@novorender/api";
import { BaseDemoHost } from "./base";

type Args = [View, HTMLCanvasElement | undefined];
type Ret = void;
type Module = IModule<Ret, Args>;

export class ViewCondosWithCanvas2DDemoHost extends BaseDemoHost implements IDemoHost<Module> {
    async init(): Promise<void> {
        await this.loadScene("https://api.novorender.com/assets/scenes/18f56c98c1e748feb8369a6d32fde9ef/");
    }

    updateModule(module: Module) {
        const {
            canvasElements: { canvas2D },
        } = this.context;
        module.main(this.view, canvas2D);
    }
}
