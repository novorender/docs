import demo1 from '!!./demo1.ts?raw';
import { demo } from "../../misc";

export const dynamicObjects = {
    ...demo("dynamicObject", demo1, 'Adding dynamic 3D objects into the view.'),
};
