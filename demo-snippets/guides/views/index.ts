import { demo } from "../../demo";
import { BareboneDemoHost, ViewDemoHost } from "../../hosts";
/** Here goes code demo code that you can see in the playground */
import creation from "./creation.ts?raw";
import animation from "./animation.ts?raw";
import environments from "./environments.ts?raw";

const dirName = "views";

export const views = {
    ...demo(dirName, "creation", "View creation", creation, BareboneDemoHost, {}, "View creation example."),
    ...demo(dirName, "animation", "View animation", animation, ViewDemoHost, {}, "View animation example."),
    ...demo(dirName, "environments", "Environments", environments, ViewDemoHost, {}, "View IBL environments example."),
};
