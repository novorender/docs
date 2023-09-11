import { demo } from "../../demo";
import { ViewDemoHost, ControllerDemoHost } from "../../hosts";
/** Here goes code demo code that you can see in the playground */
import cameraState from "./cameraState.ts?raw";
import controllerParams from "./controllerParams.ts?raw";
import controllerProperties from "./controllerProperties.ts?raw";

const dirName = "getting_started";

export const cameraControllers = {
    ...demo(dirName, "cameraState", "Camera state", cameraState, ViewDemoHost, {}, "Camera state example."),
    ...demo(dirName, "controllerParams", "Controller params", controllerParams, ControllerDemoHost, {}, "Camera controller parameters example."),
    ...demo(dirName, "controllerProperties", "Controller properties", controllerProperties, ControllerDemoHost, {}, "Camera controller properties example."),
};
