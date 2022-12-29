import { API, View } from "@novorender/webgl-api";
import { createAPI as createDataApi } from "@novorender/data-js-api";

export async function main(api: API, canvas: HTMLCanvasElement) {
  // Initialize the data API with the Novorender data server service
  const dataApi = createDataApi({
    serviceUrl: "https://data.novorender.com/api",
  });

  try {
    // Load scene metadata
    const sceneData = await dataApi
      // Condos scene ID, but can be changed to any public scene ID
      .loadScene("95a89d20dd084d9486e383e131242c4c")
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
    const scene = await api.loadScene(url, db);

    // The code above is all you need to load the scene,
    // however there is more scene data loaded that you can apply

    // Create a view with the scene's saved settings
    const view = await api.createView(settings, canvas);

    // Create a camera controller with the saved parameters with turntable as fallback
    const camera = cameraParams ?? ({ kind: "turntable" } as any);
    view.camera.controller = api.createCameraController(camera, canvas);

    // Assign the scene to the view
    view.scene = scene;

    // Run render loop
    run(view, canvas);
  } catch (e) {
    // Handle errors however you like
    console.warn(e);
  }
}

async function run(view: View, canvas: HTMLCanvasElement): Promise<void> {
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
