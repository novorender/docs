// HiddenRangeStarted
import * as WebglApi from "@novorender/webgl-api";
import * as MeasureApi from '@novorender/measure-api';
import * as DataJsApi from '@novorender/data-js-api';
import * as GlMatrix from 'gl-matrix';

export interface IParams {
  webglApi: typeof WebglApi;
  measureApi: typeof MeasureApi;
  dataJsApi: typeof DataJsApi;
  glMatrix: typeof GlMatrix;
  canvas: HTMLCanvasElement;
  canvas2D: HTMLCanvasElement;
  previewCanvas: HTMLCanvasElement;
};

// HiddenRangeEnded
export async function main({ webglApi, dataJsApi, canvas }: IParams) {

  try {
    // load scene into data api, create webgl api, view and load scene.
    const view = await initView(webglApi, dataJsApi, canvas);

    const scene = view.scene!;

    // run render loop and canvas resizeObserver
    run(view, canvas);

    const iterator = scene.search({
      searchPattern: "Roof",
      // True so that metadata is preloaded
      full: true,
    });

    const searchResult: WebglApi.ObjectData[] = [];

    // Use the first 5 results to keep the properties in the property box
    // relatively short
    for (let i = 0; i < 5; i++) {

      const iteratorResult = await iterator.next();

      if (iteratorResult.done) {
        break;
      }

      // Because we have set the search option "full: true"
      // .loadMetadata() will not result in any more requests being made
      // Try flipping it to false and see the difference in the network request log
      const objectWithMetadata = await iteratorResult.value.loadMetaData();
      searchResult.push(objectWithMetadata);
    }

    // Highlight results
    highlightObjects(
      scene,
      searchResult.map((object) => object.id)
    );
    // Display metadata
    openInfoPane(searchResult);
  } catch (e) {
    // Handle however you like
    console.warn(e);
  }
}

function highlightObjects(scene: WebglApi.Scene, ids: number[]): void {
  // Reset highlights
  scene.objectHighlighter.objectHighlightIndices.fill(0);

  // Set highlight to 1 for the selected objects
  // In this case the highlight is green, set in initView()
  ids.forEach((id) => (scene.objectHighlighter.objectHighlightIndices[id] = 1));

  scene.objectHighlighter.commit();
}

// HiddenRangeStarted
async function initView(
  webglApi: typeof WebglApi,
  dataJsAPI: typeof DataJsApi,
  canvas: HTMLCanvasElement,
): Promise<WebglApi.View> {
  // Initialize the data API with the Novorender data server service
  const dataApi = dataJsAPI.createAPI({
    serviceUrl: "https://data.novorender.com/api",
  });

  // Load scene metadataa
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

  // make object highlights
  const highlightGroup0 = api.createHighlight({ kind: "neutral" });
  const highlightGroup1 = api.createHighlight({
    kind: "color",
    color: [0, 1, 0],
  });
  view.settings.objectHighlights = [highlightGroup0, highlightGroup1];

  return view;
}

async function run(view: WebglApi.View, canvas: HTMLCanvasElement): Promise<void> {
  // Create a bitmap context to display render output
  const ctx = canvas.getContext("bitmaprenderer");

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