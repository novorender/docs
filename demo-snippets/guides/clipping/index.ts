import { demo } from "../../demo";
import { ClippingDemoHost } from "../../hosts";
/** Here goes code demo code that you can see in the playground */
import single from "./single.ts?raw";
import offset from "./offset.ts?raw";
import flipped from "./flipped.ts?raw";
import rotated from "./rotated.ts?raw";
import dual from "./dual.ts?raw";
import slab from "./slab.ts?raw";
import slab_inv from "./slab_inv.ts?raw";
import box from "./box.ts?raw";
import outlines from "./outlines.ts?raw";
import visualize from "./visualize.ts?raw";
import planeFromNormal from "./planeFromNormal.ts?raw";

const dirName = "clipping";

export const clipping = {
    ...demo(dirName, "single", "Single Clipping Plane", single, ClippingDemoHost, { contentHeight: 150 }, "A single clipping plane."),
    ...demo(dirName, "offset", "Offset Clipping Plane", offset, ClippingDemoHost, { contentHeight: 150 }, "An offset clipping plane."),
    ...demo(dirName, "flipped", "Flipped Clipping Plane", flipped, ClippingDemoHost, { contentHeight: 150 }, "A flipped clipping plane."),
    ...demo(dirName, "rotated", "Rotated Clipping Plane", rotated, ClippingDemoHost, { contentHeight: 300 }, "A rotated clipping plane."),
    ...demo(dirName, "dual", "Dual Clipping Planes", dual, ClippingDemoHost, { contentHeight: 150 }, "Two clipping planes."),
    ...demo(dirName, "slab", "Slab Clipping Volume", slab, ClippingDemoHost, { contentHeight: 150 }, "Two clipping planes forming a slab volume."),
    ...demo(dirName, "slab_inv", "Inverted Slab Clipping Volume", slab_inv, ClippingDemoHost, { contentHeight: 150 }, "Two clipping planes forming an inverted slab volume."),
    ...demo(dirName, "box", "Box Clipping Volume", box, ClippingDemoHost, { contentHeight: 350 }, "Six clipping planes forming a box volume."),
    ...demo(dirName, "outlines", "Clipping Plane Outlines", outlines, ClippingDemoHost, { contentHeight: 150 }, "Clipping plane intersection outlines."),
    ...demo(dirName, "visualize", "Clipping Plane Visualization", visualize, ClippingDemoHost, { contentHeight: 250 }, "Clipping plane visualizations."),
    ...demo(dirName, "planeFromNormal", "Picking and making plane from normal", planeFromNormal, ClippingDemoHost, { contentHeight: 250 }, "Picking and making plane from normal."),
};
