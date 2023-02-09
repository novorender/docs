import * as NovoRender from "@novorender/webgl-api";
import * as MeasureAPI from "@novorender/measure-api";
import * as DataJsAPI from "@novorender/data-js-api";
import * as GlMatrix from "gl-matrix";

export interface IParams {
  webglAPI: NovoRender.API;
  canvas: HTMLCanvasElement;
  measureAPI: typeof MeasureAPI;
  dataJsAPI: typeof DataJsAPI;
  glMatrix: typeof GlMatrix;
  canvas2D: HTMLCanvasElement;
}

export async function main({ webglAPI, canvas, dataJsAPI }: IParams) {
  try {
    // Init
    const view = await initView(webglAPI, canvas, dataJsAPI);
    run(view, canvas);

    const scene = view.scene!;

    // Run the searches
    // Path is similar to filesystem file/folder hierarchical paths, e.g. my_folder/my_object
    // Paths reflect original CAD model hierarchy (.ifc, .rvm, etc)
    // This will find all objects on the 2nd floor
    const iterator = scene.search({
      parentPath:
        "Farger.IFC/3/Surface:2481563/Apartment with 12 condos/2ND FLOOR",
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

function isolateObjects(scene: NovoRender.Scene, ids: number[]): void {
  // Set highlight 255 on all objects
  // Highlight index 255 is reserved fully transparent
  scene.objectHighlighter.objectHighlightIndices.fill(255);

  // Set highlight back to 0 for objects to be isolated
  // Highlight 0 should be neutral as we haven't changed view.settings.objectHighlights
  ids.forEach((id) => (scene.objectHighlighter.objectHighlightIndices[id] = 0));

  scene.objectHighlighter.commit();
}

async function initView(
  api: NovoRender.API,
  canvas: HTMLCanvasElement,
  dataJsAPI: typeof DataJsAPI
): Promise<NovoRender.View> {
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

async function run(
  view: NovoRender.View,
  canvas: HTMLCanvasElement
): Promise<void> {
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
