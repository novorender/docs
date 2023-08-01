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
  try {
    // load scene into data api, create webgl api, view and load scene and set cameraController.
    const view = await initView(webglApi, dataJsApi, canvas);

    const scene = view.scene!;

    // run render loop and canvas resizeObserver
    run(view, canvas);

    // Run the searches
    // Same as the exact search, but with exclude. This will return all object except the ones found above.
    const iterator = scene.search({
      searchPattern: [{ property: "ifcClass", value: "ifcRoof", exact: true, exclude: true }],
    });

    // In this example we just want to isolate the objects so all we need is the object ID
    const result: number[] = [];
    for await (const object of iterator) {
      result.push(object.id);
    }

    // Then we isolate the objects found
    isolateObjects(scene, result);
  } catch (e) {
    console.warn(e);
  }
}

function isolateObjects(scene: WebglApi.Scene, ids: number[]): void {
  // Set highlight 255 on all objects
  // Highlight index 255 is reserved fully transparent
  scene.objectHighlighter.objectHighlightIndices.fill(255);

  // Set highlight back to 0 for objects to be isolated
  // Highlight 0 should be neutral as we haven't changed view.settings.objectHighlights
  ids.forEach((id) => (scene.objectHighlighter.objectHighlightIndices[id] = 0));

  scene.objectHighlighter.commit();
}
// HiddenRangeStarted
async function initView(webglApi: typeof WebglApi, dataJsAPI: typeof DataJsApi, canvas: HTMLCanvasElement): Promise<WebglApi.View> {
  // Initialize the data API with the Novorender data server service
  const dataApi = dataJsAPI.createAPI({
    serviceUrl: "https://data.novorender.com/api",
  });

  // Load scene metadata
  const sceneData = await dataApi
    // Condos scene ID, but can be changed to any public scene ID
    .loadScene("3b5e65560dc4422da5c7c3f827b6a77c")
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

  // Create a view with the scene's saved settings
  const view = await api.createView(settings, canvas);

  // Set resolution scale to 1
  view.applySettings({ quality: { resolution: { value: 1 } } });

  // Create a camera controller with the saved parameters with turntable as fallback
  const camera = cameraParams ?? ({ kind: "turntable" } as any);
  view.camera.controller = api.createCameraController(camera, canvas);

  // Assign the scene to the view
  view.scene = scene;

  return view;
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
// HiddenRangeEnded
