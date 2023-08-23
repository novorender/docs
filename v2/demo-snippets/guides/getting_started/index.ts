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

export const gettingStarted = {
  ...demo("getting_started", "Basic app", basic, BareboneDemoHost, {}, "A minimal example."),
  ...demo("getting_started", "Render state edit", renderState, RenderStateDemoHost, {}, "Render state editing example."),
  ...demo("getting_started", "Render state validation", validation, RenderStateDemoHost, {}, "Render state validation example."),
  ...demo("getting_started", "Spheres", spheres, RenderStateDemoHost, {}, "Dynamic Spheres example."),
  ...demo("getting_started", "Camera state", cameraState, ViewDemoHost, {}, "Camera state example."),
  ...demo("getting_started", "Controller params", controllerParams, ControllerDemoHost, {}, "Camera controller parameters example."),
  ...demo("getting_started", "Controller properties", controllerProperties, ControllerDemoHost, {}, "Camera controller properties example."),
};
