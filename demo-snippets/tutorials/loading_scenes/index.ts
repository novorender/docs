import publicScene from '!!./public_scene.ts?raw';
import privateScene from '!!./private_scene.ts?raw';
import { demo } from "../../misc";

export const loadingScenes = {
    ...demo("publicScene", publicScene, 'Loading public scenes.'),
    ...demo("privateScene", privateScene, 'Loading private scenes.'),
};
