// HiddenRangeStarted
import * as NovoRender from "@novorender/webgl-api";
import * as MeasureAPI from '@novorender/measure-api';
import * as DataJsAPI from '@novorender/data-js-api';
import * as GlMatrix from 'gl-matrix';

export interface IParams {
  webglAPI: NovoRender.API;
  measureAPI: typeof MeasureAPI;
  dataJsAPI: typeof DataJsAPI;
  glMatrix: typeof GlMatrix;
  canvas: HTMLCanvasElement;
  canvas2D: HTMLCanvasElement;
  previewCanvas: HTMLCanvasElement;
};

// HiddenRangeEnded
export async function main({ webglAPI, canvas }: IParams) {
  // Create a view
  const view = await webglAPI.createView(
    { background: { color: [0, 0, 0, 0] } }, // Transparent
    canvas
  );

  // Provide a camera controller
  view.camera.controller = webglAPI.createCameraController({ kind: "turntable" });

  // Load the Condos demo scene
  view.scene = await webglAPI.loadScene(NovoRender.WellKnownSceneUrls.condos);

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
