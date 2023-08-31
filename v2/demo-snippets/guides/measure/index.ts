import { demo } from "../../demo";
import { MeasureDemoHost } from "../../hosts/measure";

/** Here goes  code demo code that you can see in the playground */
import parametricMeasure from "./parametric_measure.ts?raw";

export const measure = {
  ...demo("measure", "parametric_measure", "Parametric Measure", parametricMeasure, MeasureDemoHost, {}, "Measure API can be used to fetch parametric data based on real world position, and calculate measurements between 2 objects."),
};
