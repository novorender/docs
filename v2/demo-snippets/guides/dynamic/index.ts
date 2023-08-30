import { demo } from "../../demo";
import { RenderStateDemoHost } from "../../hosts";
/** Here goes code demo code that you can see in the playground */
import gltf from "./gltf.ts?raw";
import triangle from "./triangle.ts?raw";
import instances from "./instances.ts?raw";

const dirName = "dynamic";

export const dynamic = {
  ...demo(dirName, "gltf", "Loading and rendering glTF resource", gltf, RenderStateDemoHost, { contentHeight: 150 }, "Create dynamic object from glTF resource."),
  ...demo(dirName, "triangle", "'Hello triangle' example", triangle, RenderStateDemoHost, { contentHeight: 300 }, "Create a dynamic object from scratch."),
  ...demo(dirName, "instances", "Dynamic object instancing", instances, RenderStateDemoHost, { contentHeight: 300 }, "Create multiple instances from a dynamic object."),
};
