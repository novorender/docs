import { demo } from "../../demo";
import { PickDemoHost } from "../../hosts";

/** Here goes  code demo code that you can see in the playground */
import pick from "./pick.ts?raw";

export const objectSelection = {
  ...demo("object_selection", "pick", "pick", pick, PickDemoHost, {}, "Highlighting sets/groups of objects."),
};
