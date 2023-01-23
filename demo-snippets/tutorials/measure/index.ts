import demo1 from '!!./demo1.ts?raw';
import { demo } from "../../misc";

export const measure = {
    ...demo("parametricMeasure", demo1, 'Measure API can be used to fetch parametric data based on real world position, and calculate measurements between 2 objects.'),
};
