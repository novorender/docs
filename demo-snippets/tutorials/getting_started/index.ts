import basicCube from '!!./basic_cube.ts?raw';
import basicCondos from '!!./basic_condos.ts?raw';
import basicCondos1 from '!!./basic_condos_1.ts?raw';

import { demo } from "../../misc";

export const gettingStarted = {
    ...demo("basicCube", basicCube, {}, 'A basic demonstration of the WebGL API using a predefined `cube` scene.'),
    ...demo("basicCondos", basicCondos, {}, 'A basic demonstration of the WebGL API.'),
    ...demo("basicCondos1", basicCondos1, {}, 'A basic demonstration of the WebGL API using `ResizeObserver`.'),
};
