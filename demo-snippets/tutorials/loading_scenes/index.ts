import publicScene from '!!./public_scene.ts?raw';
import privateScene from '!!./private_scene.ts?raw';
import { demo } from "../../misc";

export const loadingScenes = {
    ...demo("loading_scenes", "public_scene", publicScene, {}, 'Loading public scenes.'),
    ...demo("loading_scenes", "private_scene", privateScene, { revealLine: 22 }, 'Loading private scenes.'),
};
