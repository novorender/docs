import { demo } from "../../demo";
import { ViewCondosDemoHost } from "../../hosts";
/** Here goes code demo code that you can see in the playground */
import outlineLaser from "./outlineLaser.ts?raw";
import outlineLaserWithoutClipping from "./outlineLaserWithoutClipping.ts?raw";

const dirName = "outline_laser";

export const outlineLaserDemos = {
    ...demo(dirName, "outlineLaser", "Outline laser demo", outlineLaser, ViewCondosDemoHost, { contentHeight: 150 }, "Outline laser demo."),
    ...demo(dirName, "outlineLaserWithoutClipping", "Outline laser without Clipping Planes", outlineLaserWithoutClipping, ViewCondosDemoHost, { contentHeight: 150 }, "Outline laser without Clipping Planes."),
};
