import drawing2d from '!!./drawing_2d.ts?raw';
import { demo } from "../../misc";

export const drawing2D = {
    ...demo("drawing2D", "drawing_2d", drawing2d, { revealLine: 21, hiddenAreas: [{ startLineNumber: 0, endLineNumber: 441 }] }, 'Measure API can be used to draw measure entity or results into a 2D canvas.'),
};
