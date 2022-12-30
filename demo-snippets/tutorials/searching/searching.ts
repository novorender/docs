import { API, View, Scene } from "@novorender/webgl-api";
import { createAPI as createDataApi } from "@novorender/data-js-api";

export async function main(api: API, canvas: HTMLCanvasElement) {
  try {
    // Init
    const view = await initView(api, canvas);
    run(view, canvas);

    const scene = view.scene!;

    // Run the searches
    // Try changing which search to run

    // Path is similar to filesystem file/folder hierarchical paths, e.g. my_folder/my_object
    // Paths reflect original CAD model hierarchy (.ifc, .rvm, etc)
    // This will find all objects on the 2nd floor
    const iterator = scene.search({
      parentPath:
        "Farger.IFC/3/Surface:2481563/Apartment with 12 condos/2ND FLOOR",
    });

    // Fluffy search which will search all properties for words starting with "Roof"
    // "Roo" will still find roofs, but "oof" will not
    // const iterator = scene.search({ searchPattern: "Roof" });

    // Exact search only checking the propery "ifcClass" and the exact value "ifcRoof"
    // const iterator = scene.search({
    //   searchPattern: [{ property: "ifcClass", value: "ifcRoof", exact: true }],
    // });

    // Same as the one above, but with exclude. This will return all object except the ones found above.
    // const iterator = scene.search({
    //   searchPattern: [
    //     { property: "ifcClass", value: "ifcRoof", exact: true, exclude: true },
    //   ],
    // });

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

function isolateObjects(scene: Scene, ids: number[]): void {
  // Set highlight 255 on all objects
  // Highlight index 255 is reserved fully transparent
  scene.objectHighlighter.objectHighlightIndices.fill(255);

  // Set highlight back to 0 for objects to be isolated
  // Highlight 0 should be neutral as we haven't changed view.settings.objectHighlights
  ids.forEach((id) => (scene.objectHighlighter.objectHighlightIndices[id] = 0));

  scene.objectHighlighter.commit();
}

async function initView(api: API, canvas: HTMLCanvasElement): Promise<View> {
  // Initialize the data API with the Novorender data server service
  const dataApi = createDataApi({
    serviceUrl: "https://data.novorender.com/api",
  });

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

  return view;
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
