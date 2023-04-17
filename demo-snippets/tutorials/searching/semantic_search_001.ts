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
    const { url, db, settings, camera: cameraParams, objectGroups } = sceneData;

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
    const controller = api.createCameraController(camera, canvas);
    controller.autoZoomToScene = !cameraParams;
    view.camera.controller = controller;

    // Assign the scene to the view
    view.scene = scene;

    // Run render loop and the resizeObserver
    run(view, canvas);

    // For groups that have large .ids lists we have to explicitly load the IDs
    // when needed as to not bloat the .loadScene() response
    const groupIdRequests: Promise<void>[] = objectGroups.map(async (group) => {
      if ((group.selected || group.hidden) && !group.ids) {
        group.ids = await dataApi.getGroupIds(sceneId, group.id).catch(() => {
          console.warn("failed to load ids for group - ", group.id);
          return [];
        });
      }
    });

    await Promise.all(groupIdRequests);

    objectGroups.filter((group) => group.hidden).forEach((group) => group.ids?.forEach((id) => (scene.objectHighlighter.objectHighlightIndices[id] = 255)));

    scene.objectHighlighter.commit();

    createSearchUi(canvas.parentElement!, scene, sceneId, dataApi, objectGroups);
  } catch (e) {
    // Handle errors however you like
    console.warn(e);
  }
}

async function login(username: string, password: string, DATA_API_SERVICE_URL: string): Promise<string> {
  // POST to the data server service's /user/login endpoint
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

// Function to create chip
function createChip(label: string, scene: WebglApi.Scene, chipWrapper: HTMLDivElement, props: Array<string[]>, sceneId: any, dataApi: any, objectGroups: any) {
  // Create chip container div
  const chipContainer = document.createElement("div");

  chipContainer.classList.add("search-test-chip-element");

  // Create chip span
  const chipSpan = document.createElement("span");
  chipSpan.textContent = label + " ";

  // Create chip close button
  const chipCloseButton = document.createElement("button");
  chipCloseButton.textContent = "x";

  // Add click event listener to chip close button
  chipCloseButton.onclick = async () => {
    const labelToRemove = props.findIndex((p) => {
      const currentLabel = label.split(": ");
      return p[0] === currentLabel[0] && p[1] === currentLabel[1];
    });

    if (labelToRemove !== -1) {
      props.splice(labelToRemove, 1);
      await createChipElementsThenSearchAndIsolate(scene, chipWrapper, props, sceneId, dataApi, objectGroups);
    }
  };

  // Append chip span and chip close button to chip container
  chipSpan.appendChild(chipCloseButton);
  chipContainer.appendChild(chipSpan);

  // Return chip container
  return chipContainer;
}

function createSearchUi(container: HTMLElement, scene: WebglApi.Scene, sceneId: any, dataApi: any, objectGroups: any) {
  // Create container div
  const wrapper = document.createElement("div");
  const chipWrapper = document.createElement("div");

  wrapper.classList.add("search-test-wrapper-element");

  // Create index name field
  const namespace = document.createElement("input");
  namespace.type = "text";
  namespace.placeholder = "Enter pinecone index name";
  namespace.value = "banenor";
  namespace.style.width = "25%";
  // Create input field
  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "Enter search term...";

  // Create search button
  const searchButton = document.createElement("button");
  searchButton.textContent = "Search";

  let noResultsMsg: HTMLParagraphElement;

  searchButton.onclick = async () => {
    if (noResultsMsg) {
      wrapper.removeChild(noResultsMsg);
    }

    searchButton.textContent = "Loading...";

    const response = await fetch(`https://novorender-semantic-search-test-api.onrender.com/search?namespace=${namespace.value}&query=${input.value}`);
    const { res } = await response.json();
    // Replace all single quotes with double quotes so we can json parse
    const validJSONStr = res.replace(/'/g, '"');

    const props: Array<string[]> = JSON.parse(validJSONStr);

    await createChipElementsThenSearchAndIsolate(scene, chipWrapper, props, sceneId, dataApi, objectGroups);

    if (!props.length) {
      noResultsMsg = document.createElement("p");
      noResultsMsg.textContent = "No results found for you query, try rephrasing your query.";
      wrapper.appendChild(noResultsMsg);
    }

    searchButton.textContent = "Search";
    input.value = "";
  };

  // Append input field and search button to container
  wrapper.appendChild(namespace);
  wrapper.appendChild(input);
  wrapper.appendChild(searchButton);
  wrapper.appendChild(chipWrapper);

  // Append container and chip container to the document body
  container.appendChild(wrapper);
}

function createChipElements(scene: WebglApi.Scene, chipWrapper: HTMLDivElement, props: Array<string[]>, sceneId: any, dataApi: any, objectGroups: any) {
  chipWrapper.replaceChildren(
    ...props.map((chip) => {
      return createChip(`${chip[0]}: ${chip[1]}`, scene, chipWrapper, props, sceneId, dataApi, objectGroups);
    })
  );
}

async function createChipElementsThenSearchAndIsolate(scene: WebglApi.Scene, chipWrapper: HTMLDivElement, props: Array<string[]>, sceneId: any, dataApi: any, objectGroups: any) {
  // For groups that have large .ids lists we have to explicitly load the IDs
  // when needed as to not bloat the .loadScene() response
  const groupIdRequests: Promise<void>[] = objectGroups.map(async (group: any) => {
    if ((group.selected || group.hidden) && !group.ids) {
      group.ids = await dataApi.getGroupIds(sceneId, group.id).catch(() => {
        console.warn("failed to load ids for group - ", group.id);
        return [];
      });
    }
  });

  await Promise.all(groupIdRequests);

  scene.objectHighlighter.objectHighlightIndices.fill(0);
  objectGroups.filter((group: any) => group.hidden).forEach((group: any) => group.ids?.forEach((id: any) => (scene.objectHighlighter.objectHighlightIndices[id] = 255)));

  scene.objectHighlighter.commit();

  // reset and then re-apply the search

  // scene.objectHighlighter.commit();
  createChipElements(scene, chipWrapper, props, sceneId, dataApi, objectGroups);
  if (props.length) {
    await searchAndIsolate(scene, props);
  }
}

async function searchAndIsolate(scene: WebglApi.Scene, props: Array<string[]>) {
  console.log("searchAndIsolate ", props);

  // Run the searches
  // Exact search only checking the property "ifcClass" and the exact value "ifcRoof"
  const iterator = scene.search({
    searchPattern: props.map((i: any) => ({ property: i[0], value: i[1], exact: true })),
  });

  // In this example we just want to isolate the objects so all we need is the object ID
  const result: number[] = [];
  for await (const object of iterator) {
    console.log("ite ", object);
    result.push(object.id);
  }

  console.log("result ", result);

  // Then we isolate the objects found
  isolateObjects(scene, result);
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
