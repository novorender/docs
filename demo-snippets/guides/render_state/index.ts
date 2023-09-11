import { demo } from "../../demo";
import { StateDemoHost } from "../../hosts";
/** Here goes code demo code that you can see in the playground */
import validation from "./validation.ts?raw";

const dirName = "render_state";

export const renderState = {
    ...demo(dirName, "validation", "Render state validation", validation, StateDemoHost, {}, "Render state validation example."),
};
