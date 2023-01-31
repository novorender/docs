import pick from '!!./pick.ts?raw';
import { demo } from "../../misc";

export const objectSelection = {
    ...demo("object_selection", "pick", pick, {}, 'Highlighting sets/groups of objects.'),
};
