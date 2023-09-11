import { demo } from "../../demo";
import { StateDemoHost, BareboneDemoHost } from "../../hosts";
/** Here goes code demo code that you can see in the playground */
import basic from "./basic.ts?raw";
import renderState from "./renderState.ts?raw";

const dirName = "interactive_examples";

export const interactiveExamples = {
    ...demo(dirName, "basic", "Basic app", basic, BareboneDemoHost, { contentHeight: 150 }, "A minimal example."),
    ...demo(dirName, "renderState", "Render state edit", renderState, StateDemoHost, {}, "Render state editing example."),
};
