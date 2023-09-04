import { demo } from "../../demo";
import { ViewCondosDemoHost, ViewCondosWithCanvas2DDemoHost } from "../../hosts";

/** Here goes  code demo code that you can see in the playground */
import parametricMeasure from "./parametric_measure.ts?raw";
import measureLine from "./measure_line.ts?raw";
import drawing2d from "./drawing_2d.ts?raw";

const dirName = "measure";

export const measure = {
  ...demo(dirName, "parametric_measure", "Parametric Measure", parametricMeasure, ViewCondosDemoHost, {}, "Measure API can be used to fetch parametric data based on real world position, and calculate measurements between 2 objects."),
  ...demo(dirName, "measure_line", "Measure Line", measureLine, ViewCondosWithCanvas2DDemoHost, {}, "Using Measure Module to drawing a line for measurements into a 2D canvas."),
  ...demo(dirName, "drawing_2d", "2D Drawing", drawing2d, ViewCondosWithCanvas2DDemoHost, {}, "Draw measure entity or results into a 2D canvas."),
};
