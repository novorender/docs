import { demo } from "../../demo";
import { RenderStateDemoHost } from "../../hosts";
/** Here goes code demo code that you can see in the playground */
import spheres from "./spheres.ts?raw";
import basic from "./basic.ts?raw";

export const gettingStarted = {
  ...demo("getting_started", "basic_condos", basic, RenderStateDemoHost, {}, "A basic demonstration of the WebGL Web API."),
  ...demo("getting_started", "spheres", spheres, RenderStateDemoHost, {}, "Dynamic Spheres."),
};
