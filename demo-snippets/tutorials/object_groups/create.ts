import {
  API,
  createAPI,
  Scene,
  SearchPattern,
  View,
  WellKnownSceneUrls,
} from "@novorender/webgl-api";
import { SceneData, ObjectGroup } from "@novorender/data-js-api";

// Condos demo scene
const SCENE_ID = "1169297611ae33f63132f264ed34e265";

export async function main(api: API, canvas: HTMLCanvasElement) {
  // Mock dataApi as to not actually modify the scene in the demo
  const dataApi = createMockDataApi();
  const view = await initView(api, canvas);
  const scene = view.scene!;
  run(view, canvas);

  const searchPattern: SearchPattern[] = [
    {
      property: "path",
      value: "Farger.IFC/3/Surface:2481563/Apartment with 12 condos/2ND FLOOR",
      exact: true,
    },
  ];

  const secondFloor: ObjectGroup = {
    // This search is run on the server every time the scene is rebuilt
    // and the resulting object IDs are saved to the group.ids property
    search: searchPattern,
    // The search is not run when the groups are saved
    // so you have to run it client side and set the .ids property yourself
    ids: await search(scene, searchPattern),
    // Search deep
    includeDescendants: true,
    // The remaining properties are not used for anything on the server
    // Group id - UUIDv4 in this case, but it's up to you
    id: "56196cbf-f5aa-4f65-9934-911546f89225",
    name: "2nd floor", // Display name
    grouping: "", // We use this as a path style string to nest groups in the UI
    color: [1, 0, 0, 1], // Can be used to highlight objects in group
    selected: false,
    hidden: false,
  };

  // Before saving it is a good idea to load the latest scene data
  // in case it has been modifed by someone else as there is currently no way of just adding groups.
  const sceneData = await dataApi.loadScene(SCENE_ID);

  dataApi.putScene({
    // Keep most of the data
    ...sceneData,
    // scene.id is the id of the main/admin scene while SCENE_ID is the viewer scene id
    url: `${SCENE_ID}:${scene.id}`,
    // Overwrite .objectGroups
    objectGroups: [secondFloor],
  });

  // Now that the group is saved the .ids property will be kept up to date by the server
}

// Search utility fn to return array of object IDs
async function search(
  scene: Scene,
  searchPattern: SearchPattern[]
): Promise<number[]> {
  const iterator = scene.search({ searchPattern });

  const result: number[] = [];
  for await (const object of iterator) {
    result.push(object.id);
  }

  return result;
}

function createMockDataApi() {
  return {
    putScene: async (_sceneData: SceneData): Promise<boolean> => true,
    loadScene: async (_id: string): Promise<SceneData> => ({} as SceneData),
  };
}

async function initView(api: API, canvas: HTMLCanvasElement): Promise<View> {
  // Create a view
  const view = await api.createView(
    { background: { color: [0, 0, 0, 0] } }, // Transparent
    canvas
  );

  // Provide a camera controller
  view.camera.controller = api.createCameraController({ kind: "turntable" });

  // Load the Condos demo scene
  view.scene = await api.loadScene(WellKnownSceneUrls.condos);

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
