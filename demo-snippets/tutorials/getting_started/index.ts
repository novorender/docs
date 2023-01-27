import demoScene from '!!./demo_scene.ts?raw';
import { demo } from "../../misc";

export const gettingStarted = {
    ...demo("demoScene1", demoScene, {}, 'A basic demonstration of the WebGL API without `ResizeObserver`.'),
    ...demo("demoScene", demoScene, {}, 'A basic demonstration of the WebGL API.'),
};
