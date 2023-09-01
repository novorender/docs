import { demo } from "../../demo";
import { ViewDemoHost } from "../../hosts";
/** Here goes  code demo code that you can see in the playground */
import publicScene from "./public_scene.ts?raw";
import privateScene from "./private_scene.ts?raw";

const dirName = "loading_scenes";

export const loadingScenes = {
  ...demo(dirName, "public_scene", "Public Scene", publicScene, ViewDemoHost, {}, "Loading public scenes."),
  ...demo(dirName, "private_scene", "Private Scene", privateScene, ViewDemoHost, {}, "Loading private   scenes."),
};
