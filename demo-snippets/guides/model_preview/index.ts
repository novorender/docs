import { demo } from "../../demo";
import { ModelPreviewDemoHost } from "../../hosts";

/** Here goes  code demo code that you can see in the playground */
import preview from "./preview.ts?raw";

export const modelPreview = {
    ...demo("model_preview", "preview", "Model preview", preview, ModelPreviewDemoHost, {}, "Model preview."),
};
