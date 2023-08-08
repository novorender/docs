// HiddenRangeStarted
import * as WebglApi from "@novorender/webgl-api";
import * as MeasureApi from "@novorender/measure-api";
import * as DataJsApi from "@novorender/data-js-api";
import * as GlMatrix from "gl-matrix";
import * as WebApp from "@novorender/api";

export interface IParams {
  webglApi: typeof WebglApi;
  measureApi: typeof MeasureApi;
  dataJsApi: typeof DataJsApi;
  glMatrix: typeof GlMatrix;
  canvas: HTMLCanvasElement;
  canvas2D: HTMLCanvasElement;
  previewCanvas: HTMLCanvasElement;
  web_app: typeof WebApp;
}

// HiddenRangeEnded
export async function main({ web_app, canvas }: IParams) {
  const gpuTier = 2; // laptop with reasonably new/powerful GPU.
  const deviceProfile = web_app.getDeviceProfile(gpuTier);

  let A = new URL(".", window.location.origin + "/v2/");

  const imports = await web_app.downloadImports({ baseUrl: A }); // or whereever you copied the public/ files from the package.
  const view = new web_app.View(canvas, deviceProfile, imports);
  view.modifyRenderState({ grid: { enabled: true } });
  await view.run();
  view.dispose();
}
