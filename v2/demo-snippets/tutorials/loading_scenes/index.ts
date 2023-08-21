import { demo } from "../../demo";
import { ViewDemoHost } from "../../hosts";
/** Here goes  code demo code that you can see in the playground */
import publicScene from "./public_scene.ts?raw";
import privateScene from "./private_scene.ts?raw";

export const loadingScenes = {
  ...demo("loading_scenes", "public_scene", publicScene, ViewDemoHost, {}, "Loading public scenes."),
  ...demo("loading_scenes", "private_scene", privateScene, ViewDemoHost, {}, "Loading private   scenes."),
};
