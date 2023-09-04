import { demo } from "../../demo";
import { ViewCondosDemoHost, StateCondosDemoHost } from "../../hosts";

/** Here goes code demo code that you can see in the playground */
import pick from "./pick.ts?raw";
import color from "./color.ts?raw";
import defaultAction from "./default.ts?raw";
import interactive from "./interactive.ts?raw";

const dirName = "object_selection";

export const objectSelection = {
    ...demo(dirName, "pick", "Object picking", pick, ViewCondosDemoHost, {}, "Pick objects by clicking on them."),
    ...demo(dirName, "color", "Object color highlight", color, StateCondosDemoHost, {}, "Highlight specified objects."),
    ...demo(dirName, "defaultAction", "Object default highlight", defaultAction, StateCondosDemoHost, {}, "Apply default highlight to all objects not in a group."),
    ...demo(dirName, "interactive", "Interactive highlight", interactive, ViewCondosDemoHost, {}, "Highlight picked objects."),
};
