import { IDemoContext, IDemoHost, IModule } from "../demo";
import { View, OrbitController, DeviceProfile, Core3DImports } from "@novorender/api";

type Args = [canvas: HTMLCanvasElement, deviceProfile: DeviceProfile, imports: Core3DImports, signal: AbortSignal];
type Ret = Promise<void>;
type Module = IModule<Ret, Args>;

export class BareboneDemoHost implements IDemoHost<Module> {
  private _resolveRun: () => void = undefined!;
  private _abort: AbortController | undefined;
  private _mainPromise: Promise<void> | undefined;

  constructor(readonly context: IDemoContext) {}

  async run(): Promise<void> {
    const promise = new Promise<void>((resolve) => {
      this._resolveRun = resolve;
    });
    await promise;
  }

  async execute(module: Module) {
    console.log("dude");
    console.log(this.context);
    const {
      canvasElements: { primaryCanvas: canvas },
      deviceProfile,
      imports,
    } = this.context;
    console.log(canvas);
    this._abort?.abort();
    this._abort = new AbortController();
    const signal = this._abort.signal;
    try {
      await this._mainPromise;
      this._mainPromise = module.main(canvas, deviceProfile, imports, signal);
    } catch (error) {
      console.log("error while running module ", error);
      this.context.reportErrors([error as Error]);
    }
  }

  updateModule(module: Module) {
    this.execute(module);
  }

  async exit(): Promise<void> {
    this._abort?.abort();
    await this._mainPromise;
    this._resolveRun();
  }
}
