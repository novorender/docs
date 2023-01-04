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

// Condos demo scene
const SCENE_ID = "c132d3eecf4f4247ace112410f4219aa";

export async function main({ webglAPI, canvas, dataJsAPI }: IParams) {
  try {
    const [view, dataApi, objectGroups] = await initView(webglAPI, canvas, dataJsAPI);
    const scene = view.scene!;
    run(view, canvas);

    // Find floor groups
    const floors = objectGroups.filter(
      (group) => group.grouping?.toLowerCase() === "floors"
    );

    // Create buttons
    createFloorButtons(floors, (floor: DataJsAPI.ObjectGroup | undefined) => {
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
async function handleVisibilityChanges(
  dataApi: DataJsAPI.API,
  scene: NovoRender.Scene,
  groups: DataJsAPI.ObjectGroup[]
) {
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
  groups
    .filter((group) => group.hidden)
    .forEach((group) =>
      group.ids?.forEach(
        (id) => (scene.objectHighlighter.objectHighlightIndices[id] = 255)
      )
    );

  scene.objectHighlighter.commit();
}

// UI setup
function createFloorButtons(
  floors: DataJsAPI.ObjectGroup[],
  onClick: (floor?: DataJsAPI.ObjectGroup) => void
): void {
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

  document.body.append(wrapper);
}

async function initView(
  api: NovoRender.API,
  canvas: HTMLCanvasElement,
  dataJsAPI: typeof DataJsAPI
): Promise<[NovoRender.View, DataJsAPI.API, DataJsAPI.ObjectGroup[]]> {
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

  // Load scene
  const scene = await api.loadScene(url, db);

  // Create a view with the scene's saved settings
  const view = await api.createView(settings, canvas);

  // Create a camera controller with the saved parameters with turntable as fallback
  const camera = cameraParams ?? ({ kind: "turntable" } as any);
  view.camera.controller = api.createCameraController(camera, canvas);

  // Assign the scene to the view
  view.scene = scene;

  return [view, dataApi, objectGroups];
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
