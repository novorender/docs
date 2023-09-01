import { IDemoHost } from "../demo";
import { RenderStateChanges, View } from "@novorender/api";
import { BaseDemoHost } from "./base";

interface Module {
	init?(view: View): Promise<void> | void;
	update(time: number): RenderStateChanges;
}

export class StateAnimationDemoHost extends BaseDemoHost implements IDemoHost<Module> {
	module: Module | undefined;

	async animate(time: number) {
		const stateChanges = this.module?.update(time);
		if (stateChanges) {
			this.modifyRenderState(stateChanges);
		}
	}

	async updateModule(module: Module) {
		// TODO: verify module shape first
		try {
			await module.init?.(this.view);
			this.module = module;
		} catch (error) {
			this.context.reportErrors(error);
		}
	}
}
