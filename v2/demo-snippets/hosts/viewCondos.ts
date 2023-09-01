import { ViewDemoHost } from "./view";

export class ViewCondosDemoHost extends ViewDemoHost {
	async init(): Promise<void> {
		await this.loadScene("https://api.novorender.com/assets/scenes/18f56c98c1e748feb8369a6d32fde9ef/");
	}
}
