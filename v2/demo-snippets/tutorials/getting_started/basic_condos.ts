// HiddenRangeStarted
import * as WebglApi from "@novorender/webgl-api";
import * as MeasureApi from "@novorender/measure-api";
import * as DataJsApi from "@novorender/data-js-api";
import * as GlMatrix from "gl-matrix";
import * as WebApp from "@novorender/web_app";

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
export async function main({ webglApi, dataJsApi, canvas, web_app }: IParams) {
  console.log("web_app ", web_app);
  // initialize the webgl api
  const api = webglApi.createAPI();

  // Create a view
  const view = new (web_app.View as any)(canvas, web_app.getDeviceProfile(0));

  const dataApi = dataJsApi.createAPI({
    serviceUrl: "https://data.novorender.com/api",
  });

  try {
    const [{ url, db, ...sceneData }, camera] = await loadScene(dataApi, "95a89d20dd084d9486e383e131242c4c");
    const webgl2Bin = new URL(url);
    webgl2Bin.pathname += "webgl2_bin/";
    await view.loadSceneFromURL(webgl2Bin);
    view.run();
  } catch (error) {
    console.log("errrrrr ", error);
  }

  // // load a predefined scene into the view, available scenes are cube, oilrig, condos
  // view.scene = await api.loadScene(webglApi.WellKnownSceneUrls.condos);

  // // provide a camera controller, available controller types are static, orbit, flight and turntable
  // view.camera.controller = api.createCameraController({ kind: "turntable" });

  // // Create a bitmap context to display render output
  // const ctx = canvas.getContext("bitmaprenderer");

  // // Handle canvas resizes
  // new ResizeObserver((entries) => {
  //   for (const entry of entries) {
  //     canvas.width = entry.contentRect.width;
  //     canvas.height = entry.contentRect.height;
  //     view.applySettings({
  //       display: { width: canvas.width, height: canvas.height },
  //     });
  //   }
  // }).observe(canvas);

  // // render-loop https://dens.website/tutorials/webgl/render-loop
  // while (true) {
  //   // Render frame
  //   const output = await view.render();
  //   {
  //     // Finalize output image
  //     const image = await output.getImage();
  //     if (image) {
  //       // Display the given ImageBitmap in the canvas associated with this rendering context.
  //       ctx?.transferFromImageBitmap(image);
  //       // release bitmap data
  //       image.close();
  //     }
  //   }
  //   (output as any).dispose();
  // }
}

export async function loadScene(dataApi: DataJsApi.API, id: string): Promise<any> {
  const res = await dataApi.loadScene(id);
  const camera = undefined;

  if ("error" in res) {
    throw res;
  }

  const { ..._cfg } = res;
  const cfg = _cfg;

  return [cfg, camera];
}
