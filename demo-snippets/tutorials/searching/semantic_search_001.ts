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
export async function main({ webglApi, dataJsApi, canvas }: IParams) {
  // Hardcoded values for demo purposes
  const username = "";
  const password = "";
  const sceneId = "";

  const DATA_API_SERVICE_URL = "https://data.novorender.com/api";

  // For the demo we have simplified the login flow to always run the login call
  const accessToken = await login(username, password, DATA_API_SERVICE_URL);

  // Initialize the data API with the Novorender data server service
  // and a callback which returns the auth header with the access token
  const dataApi = dataJsApi.createAPI({
    serviceUrl: DATA_API_SERVICE_URL,
    authHeader: async () => ({
      header: "Authorization",
      // We are using pre-generated demo token here for brevity.
      // To get your own token, look at "https://docs.novorender.com/data-rest-api/#/operations/Login".
      value: `Bearer ${accessToken}`,
    }),
  });

  // From here on everything except the scene ID is the same as for loading public scenes

  try {
    // Load scene metadata
    const sceneData = await dataApi
      // Condos scene ID, but this one requires authentication
      .loadScene(sceneId)
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
    const api = webglApi.createAPI();

    // Load scene
    const scene = await api.loadScene(url, db);

    // The code above is all you need to load the scene,
    // however there is more scene data loaded that you can apply

    // Create a view with the scene's saved settings
    const view = await api.createView(settings, canvas);

    // Set resolution scale to 1
    view.applySettings({ quality: { resolution: { value: 1 } } });

    // Create a camera controller with the saved parameters with turntable as fallback
    // available controller types are static, orbit, flight and turntable
    const camera = cameraParams ?? ({ kind: "turntable" } as any);
    view.camera.controller = api.createCameraController(camera, canvas);

    // Assign the scene to the view
    view.scene = scene;

    // Run render loop and the resizeObserver
    run(view, canvas);
  } catch (e) {
    // Handle errors however you like
    console.warn(e);
  }
}

async function login(username: string, password: string, DATA_API_SERVICE_URL: string): Promise<string> {
  // POST to the dataserver service's /user/login endpoint
  const res: { token: string } = await fetch(DATA_API_SERVICE_URL + "/user/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `username=${username}&password=${password}`,
  })
    .then((res) => res.json())
    .catch(() => {
      // Handle however you like
      return { token: "" };
    });

  return res.token;
}

async function run(view: WebglApi.View, canvas: HTMLCanvasElement): Promise<void> {
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

  // Create a bitmap context to display render output
  const ctx = canvas.getContext("bitmaprenderer");

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
