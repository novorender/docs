import { IDemoContext } from "../demo";
import { RenderStateChanges, View } from "@novorender/api";
import { vec3 } from "gl-matrix";

export abstract class BaseDemoHost {
    readonly view: View;
    readonly center = vec3.create();
    abortController: AbortController | undefined;

    constructor(readonly context: IDemoContext) {
        const {
            canvasElements: { primaryCanvas: canvas },
            deviceProfile,
        } = this.context;
        this.view = new View(canvas, deviceProfile);
    }

    async run(cb: (isReady: boolean) => void) {
        const { view } = this;
        this.abortController = new AbortController();
        await this.init?.();
        view.animate = (time) => {
            try {
                this.animate?.(time);
            } catch (error) {
                console.log(error);
                this.context.reportErrors(error);
            }
        };

        cb(true);
        await view.run(this.abortController.signal);
        view.dispose();
    }

    init?(): Promise<void>;
    animate?(time: number): Promise<void>;

    async loadScene(
        baseUrl: URL,
        sceneId: string,
        version: string = "index.json"
    ) {
        const { view } = this;
        const config = await view.loadScene(baseUrl, sceneId, version);
        const { center, radius } = config.boundingSphere;
        view.activeController.autoFit(center, radius);
        const [cx, cy, cz] = config.center;
        vec3.set(this.center, cx, -cz, cy);
    }

    modifyRenderState(stateChanges: RenderStateChanges) {
        const errors = this.view.validateRenderState(stateChanges);
        this.view.modifyRenderState(stateChanges);
        this.context.reportErrors(errors);
    }

    exit() {
        this.abortController?.abort();
    }
}
