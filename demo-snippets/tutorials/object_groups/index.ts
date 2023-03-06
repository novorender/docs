import floors from "!!./floors.ts?raw";
import { demo } from "../../misc";

export const objectGroups = {
  ...demo("object_groups", "floors", floors, {}, "Predefined groups that are set up for each floor and buttons that isolate objectGroups in the group of the clicked level."),
};
