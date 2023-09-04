import { demo } from "../../demo";
import {
  StateAnimationDemoHost,
  StateDemoHost,
  ViewDemoHost,
} from "../../hosts";
/** Here goes code demo code that you can see in the playground */
import gltf from "./gltf.ts?raw";
import triangle from "./triangle.ts?raw";
import instances from "./instances.ts?raw";
import animation from "./animation.ts?raw";
import pick from "./pick.ts?raw";

const dirName = "dynamic";

export const dynamic = {
  ...demo(
    dirName,
    "gltf",
    "Loading and rendering glTF resource",
    gltf,
    StateDemoHost,
    { contentHeight: 150 },
    "Create dynamic object from glTF resource.",
  ),
  ...demo(
    dirName,
    "triangle",
    "'Hello triangle' example",
    triangle,
    StateDemoHost,
    { contentHeight: 300 },
    "Create a dynamic object from scratch.",
  ),
  ...demo(
    dirName,
    "instances",
    "Dynamic object instancing",
    instances,
    StateDemoHost,
    { contentHeight: 300 },
    "Create multiple instances from a dynamic object.",
  ),
  ...demo(
    dirName,
    "animation",
    "Dynamic object animation",
    animation,
    StateAnimationDemoHost,
    { contentHeight: 300 },
    "Spin cube as a function of time.",
  ),
  ...demo(
    dirName,
    "pick_dynamic",
    "Dynamic object picking",
    pick,
    ViewDemoHost,
    { contentHeight: 300 },
    "Pick a cube with mouse.",
  ),
};
