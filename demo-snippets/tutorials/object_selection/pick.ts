// HiddenRangeStarted
import * as Novorender from "@novorender/webgl-api";
import * as MeasureAPI from "@novorender/measure-api";
import * as DataJsAPI from "@novorender/data-js-api";
import * as GlMatrix from "gl-matrix";

export interface IParams {
  webglAPI: Novorender.API;
  canvas: HTMLCanvasElement;
  measureAPI: typeof MeasureAPI;
  dataJsAPI: typeof DataJsAPI;
  glMatrix: typeof GlMatrix;
  canvas2D: HTMLCanvasElement;
}

// HiddenRangeEnded
export async function main({ webglAPI, canvas }: IParams) {
  // Init
  const view = await initView(webglAPI, canvas);
  const scene = view.scene!;
  run(view, canvas);

  // Set up highlight groups
  const deSaturated = webglAPI.createHighlight({
    kind: "hsla",
    saturation: 0.5,
  });
  const limeGreen = webglAPI.createHighlight({
    kind: "color",
    color: [0, 1, 0],
  });

  view.settings.objectHighlights = [deSaturated, limeGreen];

  // Listen to click events to pick objects
  canvas.addEventListener("click", async (e) => {
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
  });
}
// HiddenRangeStarted
async function initView(webglApi: Novorender.API, canvas: HTMLCanvasElement) {
  // Create a view
  const view = await webglApi.createView(
    { background: { color: [0, 0, 0, 0] } }, // Transparent
    canvas
  );

  // Provide a camera controller
  view.camera.controller = webglApi.createCameraController(
    { kind: "flight" },
    canvas
  );

  // Load the Condos demo scene
  view.scene = await webglApi.loadScene(Novorender.WellKnownSceneUrls.condos);

  return view;
}
async function run(view: Novorender.View, canvas: HTMLCanvasElement) {
  // Create a bitmap context to display render output
  const ctx = canvas.getContext("bitmaprenderer");
  
  // Handle canvas resizes
  const resizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
      canvas.width = entry.contentRect.width;
      canvas.height = entry.contentRect.height;
      view.applySettings({
        display: { width: canvas.width, height: canvas.height },
      });
    }
  });
  
  resizeObserver.observe(canvas);

  // Main render loop
  while (true) {
    // Render frame
    const output = await view.render();
    {
      // Finalize output image
      const image = await output.getImage();
      if (image) {
        // Display in canvas
        ctx?.transferFromImageBitmap(image);
        image.close();
      }
    }
  }
}
// HiddenRangeEnded