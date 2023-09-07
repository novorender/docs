import { demo } from "../../demo";
import { ObjectGroupsDemoHost } from "../../hosts";

/** Here goes  code demo code that you can see in the playground */
import floors from "./floors.ts?raw";

export const objectGroups = {
    ...demo("object_groups", "floors", "Isolating floors", floors, ObjectGroupsDemoHost, {}, "Predefined groups that are set up for each floor and buttons that isolate objectGroups in the group of the clicked level."),
};
