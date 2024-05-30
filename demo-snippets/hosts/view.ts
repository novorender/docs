import { IDemoHost, IModule } from "../demo";
import { type View } from "@novorender/api";
import { BaseDemoHost } from "./base";
import { ReadonlyVec3 } from "gl-matrix";

type Args = [View, (HTMLCanvasElement | undefined)?, (ReadonlyVec3 | undefined)?];
type Ret = void;
type Module = IModule<Ret, Args>;

export class ViewDemoHost extends BaseDemoHost implements IDemoHost<Module> {
    async updateModule(module: Module) {
        const {
            canvasElements: { canvas2D },
        } = this.context;
        let moduleError;
        try {
            // TODO: verify module shape first
            await module.main(this.view, canvas2D, this.center);
        } catch (error) {
            moduleError = error;
        } finally {
            this.context.reportErrors(moduleError);
        }
    }
}
