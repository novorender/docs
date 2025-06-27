import { IDemoContext, IDemoHost, IModule } from "../demo";
import { DeviceProfile } from "@novorender/api";

type Args = [
    canvas: HTMLCanvasElement,
    deviceProfile: DeviceProfile,
    signal: AbortSignal,
];
type Ret = Promise<void>;
type Module = IModule<Ret, Args>;

export class BareboneDemoHost implements IDemoHost<Module> {
    abortController: AbortController | undefined;
    resolveRun: () => void = undefined!;
    mainPromise: Promise<void> | undefined;

    constructor(readonly context: IDemoContext) {}

    async run(cb: (isReady: boolean) => void): Promise<void> {
        const promise = new Promise<void>((resolve) => {
            this.resolveRun = resolve;
        });
        cb(true);
        await promise;
    }

    async updateModule(module: Module) {
        const {
            canvasElements: { primaryCanvas: canvas },
            deviceProfile,
        } = this.context;
        this.abortController?.abort();
        this.abortController = new AbortController();
        const { signal } = this.abortController;
        let moduleError;
        try {
            await this.mainPromise;
            this.mainPromise = module.main(canvas, deviceProfile, signal);
        } catch (error) {
            moduleError = error;
        } finally {
            this.context.reportErrors(moduleError);
        }
    }

    async exit(): Promise<void> {
        this.abortController?.abort();
        await this.mainPromise;
        this.resolveRun();
    }
}
