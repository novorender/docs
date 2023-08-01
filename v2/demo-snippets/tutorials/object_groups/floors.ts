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

// we export this function to our react component which will then execute it once the demo started running.
export function showTip() {
  return openAlert("Choose and click on any floor from the top-left to isolate the objectGroups in the selected floor's group.");
}

// Condos demo scene
const SCENE_ID = "c132d3eecf4f4247ace112410f4219aa";

// HiddenRangeEnded
export async function main({ webglApi, dataJsApi, canvas }: IParams) {
  try {
    // load scene into data api, create webgl api, view and load scene.
    const [view, dataApi, objectGroups] = await initView(webglApi, dataJsApi, canvas);

    const scene = view.scene!;

    // run render loop and canvas resizeObserver
    run(view, canvas);

    // Find floor groups
    const floors = objectGroups.filter((group) => group.grouping?.toLowerCase() === "floors");

    // Create buttons
    createFloorButtons(canvas.parentElement!, floors, (floor: DataJsApi.ObjectGroup | undefined) => {
      if (floor) {
        // Hide all floors
        floors.forEach((floor) => (floor.hidden = true));

        // Show clicked
        floor.hidden = false;
      } else {
        // Show all floors
        floors.forEach((floor) => (floor.hidden = false));
      }

      // Handle visibility changes
      handleVisibilityChanges(dataApi, scene, objectGroups);
    });
  } catch (e) {
    // Handle errors however you like
    console.warn(e);
  }
}

// ID to track if handleVisibilityChanges has been called again before IDs have finished loading
let refillId = 0;
// Hide check groups' .hidden property and toggle their objects' visibility
async function handleVisibilityChanges(dataApi: DataJsApi.API, scene: WebglApi.Scene, groups: DataJsApi.ObjectGroup[]) {
  // Reset highlights
  scene.objectHighlighter.objectHighlightIndices.fill(0);

  // For groups that have large .ids lists we have to explicitly load the IDs
  // when needed as to not bloat the .loadScene() response
  const groupIdRequests: Promise<void>[] = groups.map(async (group) => {
    if ((group.selected || group.hidden) && !group.ids) {
      group.ids = await dataApi.getGroupIds(SCENE_ID, group.id).catch(() => {
        console.warn("failed to load ids for group - ", group.id);
        return [];
      });
    }
  });

  // Increment current refillId and assign local copy
  const id = ++refillId;

  // Wait for IDs to be loaded if necessary
  await Promise.all(groupIdRequests);

  // Abort changes if they are stale
  if (id !== refillId) {
    return;
  }

  // Hide groups that have .hidden == true
  groups.filter((group) => group.hidden).forEach((group) => group.ids?.forEach((id) => (scene.objectHighlighter.objectHighlightIndices[id] = 255)));

  scene.objectHighlighter.commit();
}

// HiddenRangeStarted
// UI setup
function createFloorButtons(container: HTMLElement, floors: DataJsApi.ObjectGroup[], onClick: (floor?: DataJsApi.ObjectGroup) => void): void {
  const wrapper = document.createElement("div");
  wrapper.style.position = "absolute";
  wrapper.style.top = "0";

  floors.forEach((floor) => {
    const btn = document.createElement("button");
    btn.innerText = floor.name;
    btn.onclick = () => {
      onClick(floor);
    };

    wrapper.append(btn);
  });

  const btn = document.createElement("button");
  btn.innerText = "All";
  btn.onclick = () => {
    onClick();
  };

  wrapper.append(btn);
  container.append(wrapper);
}

async function initView(webglApi: typeof WebglApi, dataJsAPI: typeof DataJsApi, canvas: HTMLCanvasElement): Promise<[WebglApi.View, DataJsApi.API, DataJsApi.ObjectGroup[]]> {
  // Initialize the data API with the Novorender data server service
  const dataApi = dataJsAPI.createAPI({
    serviceUrl: "https://data.novorender.com/api",
  });

  // Load scene metadata
  const sceneData = await dataApi
    // Condos scene ID, but can be changed to any public scene ID
    .loadScene(SCENE_ID)
    .then((res) => {
      if ("error" in res) {
        throw res;
      } else {
        return res;
      }
    });

  // Destructure relevant properties into variables
  const { url, db, settings, camera: cameraParams, objectGroups } = sceneData;

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

  return [view, dataApi, objectGroups];
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
