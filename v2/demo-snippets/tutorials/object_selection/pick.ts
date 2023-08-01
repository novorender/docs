// HiddenRangeStarted
import * as WebglApi from "@novorender/webgl-api";
import * as MeasureApi from "@novorender/measure-api";
import * as DataJsApi from "@novorender/data-js-api";
import * as GlMatrix from "gl-matrix";

export interface IParams {
  webglApi: typeof WebglApi;
  measureApi: typeof MeasureApi;
  dataJsApi: typeof DataJsApi;
  glMatrix: typeof GlMatrix;
  canvas: HTMLCanvasElement;
  canvas2D: HTMLCanvasElement;
  previewCanvas: HTMLCanvasElement;
}

// HiddenRangeEnded
export async function main({ webglApi, canvas }: IParams) {
  // initialize the webgl api
  const api = webglApi.createAPI();

  // Create View, camera controller and load scene
  const view = await initView(api, canvas);

  const scene = view.scene!;

  // run render loop and canvas resizeObserver
  run(view, canvas);

  // Set up highlight groups
  const deSaturated = api.createHighlight({
    kind: "hsla",
    saturation: 0.5,
  });
  const limeGreen = api.createHighlight({
    kind: "color",
    color: [0, 1, 0],
  });

  view.settings.objectHighlights = [deSaturated, limeGreen];

  // Listen to click events to pick objects
  canvas.onclick = async (e: MouseEvent) => {
    const result = await view.lastRenderOutput?.pick(e.offsetX, e.offsetY);
    if (result) {
      // Reset highlights
      // Here we set all objects to use the highlight found at view.settings.objectHighlights[0]
      // In this case "deSaturated"
      scene.objectHighlighter.objectHighlightIndices.fill(0);

      // Set selected object to use highlight found at view.settings.objectHighlights[1]
      // In this case "limeGreen"
      scene.objectHighlighter.objectHighlightIndices[result.objectId] = 1;

      scene.objectHighlighter.commit();
    }
  };
}
// HiddenRangeStarted
async function initView(api: WebglApi.API, canvas: HTMLCanvasElement): Promise<WebglApi.View> {
  // Create a view
  const view = await api.createView(
    { background: { color: [0, 0, 0, 0] } }, // Transparent
    canvas
  );

  // Provide a camera controller
  view.camera.controller = api.createCameraController({ kind: "flight" }, canvas);

  // Load the Condos demo scene
  view.scene = await api.loadScene(WebglApi.WellKnownSceneUrls.condos);

  return view;
}
async function run(view: WebglApi.View, canvas: HTMLCanvasElement): Promise<void> {
  // Create a bitmap context to display render output
  const ctx = canvas.getContext("bitmaprenderer");

  // Handle canvas resizes
  new ResizeObserver((entries) => {
    for (const entry of entries) {
      canvas.width = entry.contentRect.width;
      canvas.height = entry.contentRect.height;
      view.applySettings({
        display: { width: canvas.width, height: canvas.height },
      });
    }
  }).observe(canvas);

  // render loop
  while (true) {
    // Render frame
    const output = await view.render();
    {
      // Finalize output image
      const image = await output.getImage();
      if (image) {
        // Display the given ImageBitmap in the canvas associated with this rendering context.
        ctx?.transferFromImageBitmap(image);
        // release bitmap data
        image.close();
      }
    }
    (output as any).dispose();
  }
}
// HiddenRangeEnded
