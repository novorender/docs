import * as NovoRender from "@novorender/webgl-api";
import * as MeasureAPI from '@novorender/measure-api';
import * as DataJsAPI from '@novorender/data-js-api';
import * as GlMatrix from 'gl-matrix';

export interface IParams {
  webglAPI: NovoRender.API;
  canvas: HTMLCanvasElement;
  measureAPI: typeof MeasureAPI;
  dataJsAPI: typeof DataJsAPI;
  glMatrix: typeof GlMatrix;
  canvas2D: HTMLCanvasElement;
};

const DATA_API_SERVICE_URL = "https://data.novorender.com/api";

export async function main({ webglAPI, canvas, dataJsAPI }: IParams) {
  // For the demo we have simplified the login flow to always run the login call
  const accessToken = await login();

  // Initialize the data API with the Novorender data server service
  // and a callback which returns the auth header with the access token
  const dataApi = dataJsAPI.createAPI({
    serviceUrl: DATA_API_SERVICE_URL,
    authHeader: async () => ({
      header: "Authorization",
      value: `Bearer ${accessToken}`,
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

    // Load scene
    const scene = await webglAPI.loadScene(url, db);

    // The code above is all you need to load the scene,
    // however there is more scene data loaded that you can apply

    // Create a view with the scene's saved settings
    const view = await webglAPI.createView(settings, canvas);

    // Create a camera controller with the saved parameters with turntable as fallback
    const camera = cameraParams ?? ({ kind: "turntable" } as any);
    view.camera.controller = webglAPI.createCameraController(camera, canvas);

    // Assign the scene to the view
    view.scene = scene;

    // Run render loop
    run(view, canvas);
  } catch (e) {
    // Handle errors however you like
    console.warn(e);
  }
}

async function login(): Promise<string> {
  // Hardcoded values for demo purposes
  const username = "demouser";
  const password = "demopassword";

  // POST to the dataserver service's /user/login endpoint
  const res: { token: string } = await fetch(
    DATA_API_SERVICE_URL + "/user/login",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `username=${username}&password=${password}`,
    }
  )
    .then((res) => res.json())
    .catch(() => {
      // Handle however you like
      return { token: "" };
    });

  return res.token;
}

async function run(view: NovoRender.View, canvas: HTMLCanvasElement): Promise<void> {
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
