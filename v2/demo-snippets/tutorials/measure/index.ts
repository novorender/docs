import parametricMeasure from "!!./parametric_measure.ts?raw";
import { demo } from "../../misc";

export const measure = {
  ...demo("measure", "parametric_measure", parametricMeasure, {}, "Measure API can be used to fetch parametric data based on real world position, and calculate measurements between 2 objects."),
};
