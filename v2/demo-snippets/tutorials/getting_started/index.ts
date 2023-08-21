/** Here goes  code demo code that you can see in the playground */
import spheres from "./spheres.ts?raw";
import basic from "./basic.ts?raw";
import { IDemoContext, IDemoHost, IModule, demo } from "../../config";
import { RenderStateDemoHost } from "../hosts";
import { RenderStateChanges, View } from "@novorender/api";

export const gettingStarted = {
  ...demo("getting_started", "basic_condos", basic, RenderStateDemoHost, {}, "A basic demonstration of the WebGL Web API."),
  ...demo("getting_started", "spheres", spheres, RenderStateDemoHost, {}, "Dynamic Spheres."),
};
