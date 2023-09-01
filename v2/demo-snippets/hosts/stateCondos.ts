import { StateDemoHost } from "./state";

export class StateCondosDemoHost extends StateDemoHost {
  async init(): Promise<void> {
    console.log("init");
    await this.loadScene("https://api.novorender.com/assets/scenes/18f56c98c1e748feb8369a6d32fde9ef/");
  }
}
