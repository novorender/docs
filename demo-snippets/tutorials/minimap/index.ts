import basicMinimap from "./basic_minimap.ts?raw";
import { demo } from "../../misc";

export const minimap = {
    ...demo("minimap", "basic_minimap", basicMinimap, { enablePreviewCanvas: true }, "Using tiled images as minimap."),
};
