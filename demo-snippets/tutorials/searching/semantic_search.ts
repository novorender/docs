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

    createSearchUi(canvas.parentElement!, scene);
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
        background: { color: [0, 0, 0.1, 1] },
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
function createChip(label: string, scene: WebglApi.Scene, chipWrapper: HTMLDivElement, props: Array<string[]>) {
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
      await createChipElementsThenSearchAndIsolate(scene, chipWrapper, props);
    }
  };

  // Append chip span and chip close button to chip container
  chipSpan.appendChild(chipCloseButton);
  chipContainer.appendChild(chipSpan);

  // Return chip container
  return chipContainer;
}

function createSearchUi(container: HTMLElement, scene: WebglApi.Scene) {
  // Create container div
  const wrapper = document.createElement("div");
  const chipWrapper = document.createElement("div");

  wrapper.classList.add("search-test-wrapper-element");

  // Create index name field
  const namespace = document.createElement("input");
  namespace.type = "text";
  namespace.placeholder = "Enter pinecone index name";
  namespace.value = "condos-test-index-001";
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

    const response = await fetch(`https://novorender-semantic-search-test-api.onrender.com/search?namespace=${namespace.value}&&query=${input.value}`);
    const { res } = await response.json();
    // Replace all single quotes with double quotes so we can json parse
    const validJSONStr = res.replace(/'/g, '"');

    const props: Array<string[]> = JSON.parse(validJSONStr);

    await createChipElementsThenSearchAndIsolate(scene, chipWrapper, props);

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

function createChipElements(scene: WebglApi.Scene, chipWrapper: HTMLDivElement, props: Array<string[]>) {
  chipWrapper.replaceChildren(
    ...props.map((chip) => {
      return createChip(`${chip[0]}: ${chip[1]}`, scene, chipWrapper, props);
    })
  );
}

async function createChipElementsThenSearchAndIsolate(scene: WebglApi.Scene, chipWrapper: HTMLDivElement, props: Array<string[]>) {
  // reset and re-apply the search
  scene.objectHighlighter.objectHighlightIndices.fill(0);
  scene.objectHighlighter.commit();
  createChipElements(scene, chipWrapper, props);
  if (props.length) {
    await searchAndIsolate(scene, props);
  }
}

async function searchAndIsolate(scene: WebglApi.Scene, props: Array<string[]>) {
  // Run the searches
  // Exact search only checking the property "ifcClass" and the exact value "ifcRoof"
  const iterator = scene.search({
    searchPattern: props.map((i: any) => ({ property: i[0], value: i[1], exact: true })),
  });

  // In this example we just want to isolate the objects so all we need is the object ID
  const result: number[] = [];
  for await (const object of iterator) {
    result.push(object.id);
  }

  // Then we isolate the objects found
  isolateObjects(scene, result);
}
// HiddenRangeEnded
