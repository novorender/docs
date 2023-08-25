import { demo } from "../../demo";
import { RenderStateDemoHost, ViewDemoHost, ControllerDemoHost, BareboneDemoHost } from "../../hosts";
/** Here goes code demo code that you can see in the playground */
import spheres from "./spheres.ts?raw";
import basic from "./basic.ts?raw";
import renderState from "./renderState.ts?raw";
import validation from "./validation.ts?raw";
import cameraState from "./cameraState.ts?raw";
import controllerParams from "./controllerParams.ts?raw";
import controllerProperties from "./controllerProperties.ts?raw";

const dirName = "getting_started";

export const gettingStarted = {
  ...demo(dirName, "basic", "Basic app", basic, BareboneDemoHost, { contentHeight: 150 }, "A minimal example."),
  ...demo(dirName, "renderState", "Render state edit", renderState, RenderStateDemoHost, {}, "Render state editing example."),
  ...demo(dirName, "validation", "Render state validation", validation, RenderStateDemoHost, {}, "Render state validation example."),
  ...demo(dirName, "spheres", "Spheres", spheres, RenderStateDemoHost, {}, "Dynamic Spheres example."),
  ...demo(dirName, "cameraState", "Camera state", cameraState, ViewDemoHost, {}, "Camera state example."),
  ...demo(dirName, "controllerParams", "Controller params", controllerParams, ControllerDemoHost, {}, "Camera controller parameters example."),
  ...demo(dirName, "controllerProperties", "Controller properties", controllerProperties, ControllerDemoHost, {}, "Camera controller properties example."),
};
