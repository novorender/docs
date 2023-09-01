import { IDemoContext, IDemoHost, IModule } from "../demo";
import { RecursivePartial, RenderStateClipping, View } from "@novorender/api";
import { vec3, ReadonlyVec3 } from "gl-matrix";
import { BaseDemoHost } from "./base";

type Args = [centerX: number, centerY: number, centerZ: number];
type Ret = RecursivePartial<RenderStateClipping> | undefined;
type Module = IModule<Ret, Args>;

export class ClippingDemoHost extends BaseDemoHost implements IDemoHost<Module> {
	readonly center = vec3.create();

	async init() {
		await this.loadScene("https://api.novorender.com/assets/scenes/18f56c98c1e748feb8369a6d32fde9ef/");
	}

	updateModule(module: Module) {
		// TODO: verify module shape first
		const [cx, cy, cz] = this.center;
		const stateChanges = { clipping: module.main(cx, cy, cz) };
		this.modifyRenderState(stateChanges);
	}
}
