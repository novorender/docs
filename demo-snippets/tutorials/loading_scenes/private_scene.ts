// HiddenRangeStarted
import * as WebglApi from "@novorender/webgl-api";
import * as MeasureApi from '@novorender/measure-api';
import * as DataJsApi from '@novorender/data-js-api';
import * as GlMatrix from 'gl-matrix';

export interface IParams {
  webglApi: typeof WebglApi;
  measureApi: typeof MeasureApi;
  dataJsApi: typeof DataJsApi;
  glMatrix: typeof GlMatrix;
  canvas: HTMLCanvasElement;
  canvas2D: HTMLCanvasElement;
  previewCanvas: HTMLCanvasElement;
};
const demo_access_token = localStorage.getItem('demo_access_token');
const DATA_API_SERVICE_URL = "https://data.novorender.com/api";

// HiddenRangeEnded
export async function main({ dataJsApi, webglApi, canvas }: IParams) {

  // Initialize the data API with the Novorender data server service
  // and a callback which returns the auth header with the access token
  const dataApi = dataJsApi.createAPI({
    serviceUrl: DATA_API_SERVICE_URL,
    authHeader: async () => ({
      header: "Authorization",
      // We are using pre-generated demo token here for brevity.
      // To get your own token, look at "https://docs.novorender.com/data-rest-api/#/operations/Login".
      value: `Bearer ${demo_access_token}`,
    }),
  });

  // From here on everything except the scene ID is the same as for loading public scenes

  try {
    // Load scene metadata
    const sceneData = await dataApi
      // Condos scene ID, but this one requires authentication
      .loadScene("7a0a302fe9b24ddeb3c496fb36e932b0")
      .then((res) => {
        if ("error" in res) {
          throw res;
        } else {
          return res;
        }
      });

    // Destructure relevant properties into variables
    const { url, db, settings, camera: cameraParams } = sceneData;

    // initialize the webgl api
    const { loadScene, createView, createCameraController } = webglApi.createAPI();

    // Load scene
    const scene = await loadScene(url, db);

    // The code above is all you need to load the scene,
    // however there is more scene data loaded that you can apply

    // Create a view with the scene's saved settings
    const view = await createView(settings, canvas);

    // Set resolution scale to 1
    view.applySettings({ quality: { resolution: { value: 1 } } });

    // Create a camera controller with the saved parameters with turntable as fallback
    const camera = cameraParams ?? ({ kind: "turntable" } as any);
    view.camera.controller = createCameraController(camera, canvas);

    // Assign the scene to the view
    view.scene = scene;

    // Run render loop
    run(view, canvas);
  } catch (e) {
    // Handle errors however you like
    console.warn(e);
  }
}

// HiddenRangeStarted
async function run(
  view: WebglApi.View,
  canvas: HTMLCanvasElement
): Promise<void> {
  // Handle canvas resizes
  const resizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
      canvas.width = entry.contentRect.width;
      canvas.height = entry.contentRect.height;
      view.applySettings({
        display: { width: canvas.clientWidth, height: canvas.clientHeight },
      });
    }
  });

  resizeObserver.observe(canvas);

  // Create a bitmap context to display render output
  const ctx = canvas.getContext("bitmaprenderer");

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