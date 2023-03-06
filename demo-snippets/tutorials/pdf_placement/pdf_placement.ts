// HiddenRangeStarted
import * as WebglApi from "@novorender/webgl-api";
import * as MeasureApi from "@novorender/measure-api";
import * as DataJsApi from "@novorender/data-js-api";
import * as GlMatrix from "gl-matrix";
import type { API, RecursivePartial, RenderSettings, RenderOutput, View, OrthoControllerParams, Scene } from "@novorender/webgl-api";
import type { SceneData } from "@novorender/data-js-api";
import type { DrawPart, DrawProduct } from "@novorender/measure-api";
import type { vec2, ReadonlyVec3 } from "gl-matrix";

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
  return openAlert("Choose 2 points from the 3D view (on the left) and 2 points from the PDF view (on the right), both in the identical locations, to show the computations.");
}
const DATA_API_SERVICE_URL = "https://data.novorender.com/api";

// HiddenRangeEnded
export async function main({ webglApi, measureApi, dataJsApi, glMatrix, canvas, canvas2D, previewCanvas }: IParams) {
  // Initialize the data API with the Novorender data server service
  const dataApi = dataJsApi.createAPI({
    // we're loading a public scene so it doesn't require any auth header,
    // see `https://docs.novorender.com/docs/tutorials/loading_scenes#private-scenes` if you want to load private scenes.
    serviceUrl: DATA_API_SERVICE_URL,
  });

  // Initialize measureApi instance
  const _measureApi = await measureApi.createMeasureAPI();

  // load a public scene
  const pdfScene = (await dataApi.loadScene("4f50d89ea8cd493ea3bc16f504ad5a1f")) as SceneData;

  // render config, adjust however you want
  const renderSettings: RecursivePartial<RenderSettings> = {
    quality: {
      resolution: { value: 1 }, // Set resolution scale to 1
    },
    clippingVolume: {
      enabled: true,
      mode: "union",
      planes: [[0, 1, 0, -5.5]],
    },
  };

  // create webgl api, view and load scene and set cameraController.
  const view = await initView(webglApi, canvas, pdfScene, renderSettings);

  // @todo - re-enable
  // const elevation = await getElevation(view.scene as Scene);

  let preview: string | undefined;

  if (pdfScene && !(pdfScene as any).error) {
    preview = await downloadPdfPreview(pdfScene as SceneData);
  }
  const previewCanvasContext2D = previewCanvas.getContext("2d");

  if (preview) {
    // image to draw on PDF view (right side).
    const img = new Image();
    img.onload = () => {
      if (previewCanvasContext2D) {
        previewCanvasContext2D.drawImage(
          img,
          0,
          0,
          previewCanvas.width,
          previewCanvas.height
          // 0,
          // 0,
          // previewCanvas.width,
          // previewCanvas.height
        );
      }
    };
    img.src = preview as string;
  } else {
    // just to show error details on previewCanvas, if preview failed to load
    showErrorDetails(previewCanvas, previewCanvasContext2D, (pdfScene as any).error);
  }

  /** vars for 3D view click listener */
  const context2D = canvas2D.getContext("2d");
  let currentOutput: RenderOutput;
  let selectEntity: 1 | 2 = 1;
  let posA: ReadonlyVec3 | undefined;
  let posB: ReadonlyVec3 | undefined;
  let draw: MeasureApi.DrawProduct | undefined;
  /** END */

  // 3D view click listener
  canvas.onclick = async (e: MouseEvent) => {
    if (currentOutput) {
      const pickInfo = await currentOutput.pick(e.offsetX, e.offsetY);
      if (pickInfo) {
        if (selectEntity === 1) {
          posA = pickInfo.position;
          selectEntity = 2;
        } else {
          posB = pickInfo.position;
          selectEntity = 1;
        }
        if (posA && posB) {
          draw = _measureApi.getDrawObjectFromPoints(view, [posA, posB], false, false);
        } else if (posA) {
          draw = _measureApi.getDrawObjectFromPoints(view, [posA], false, false);
        }
        await drawProduct(context2D, draw, 3, canvas2D);
      }
    }
  };

  /** vars for PDF view (right-side) click listener */
  let pdfPosA: vec2 | undefined;
  let pdfPosB: vec2 | undefined;
  let imgHeight: number;
  let imgWidth: number;
  let previewCanvasWidth: number;
  let previewCanvasHeight: number;
  let updatedPdfPosA: vec2 | null;
  let updatedPdfPosB: vec2 | null;
  let selectingA = true;
  /** END */

  // Preview Canvas (right-side) click listener
  previewCanvas.onclick = (e: MouseEvent) => {
    // destructure necessary glMatrix functions
    const {
      vec2: { fromValues, dist, sub, create, normalize, dot },
    } = glMatrix;

    if (previewCanvas && preview && previewCanvasContext2D) {
      // check if positions were updated via pane resizes
      // not necessary if you don't resize pane/canvas
      if (updatedPdfPosA) {
        pdfPosA = updatedPdfPosA;
        updatedPdfPosA = null;
      }
      if (updatedPdfPosB) {
        pdfPosB = updatedPdfPosB;
        updatedPdfPosB = null;
      }

      previewCanvasWidth = previewCanvas.width;
      previewCanvasHeight = previewCanvas.height;

      const x = e.offsetX;
      const y = e.offsetY;

      if (selectingA) {
        pdfPosA = fromValues(x, y);
      } else {
        pdfPosB = fromValues(x, y);
      }
      selectingA = !selectingA;
      if (preview && previewCanvasContext2D) {
        const img = new Image();
        img.onload = () => {
          if (previewCanvasContext2D && preview) {
            // Redraw the image to the preview canvas
            previewCanvasContext2D.clearRect(0, 0, previewCanvasWidth, previewCanvasHeight);
            previewCanvasContext2D.drawImage(img, 0, 0, previewCanvasWidth, previewCanvasHeight);
            imgHeight = img.height;
            imgWidth = img.width;
            if (pdfPosA) {
              drawArc(previewCanvasContext2D, pdfPosA[0], pdfPosA[1], "green");
            }
            if (pdfPosB) {
              drawArc(previewCanvasContext2D, pdfPosB[0], pdfPosB[1], "blue");
            }
          }
        };
        img.src = preview;
      }
      if (posA && posB && draw) {
        if (pdfPosA && pdfPosB) {
          const modelPosA = fromValues(posA[0], posA[2] * -1);
          const modelPosB = fromValues(posB[0], posB[2] * -1);
          const canvasToImageScaleX = imgWidth / previewCanvasWidth;
          const canvasToImageScaleY = imgHeight / previewCanvasHeight;
          //Invert Y axis on the pixel positions on the pdf image
          const pixelPosA = fromValues(pdfPosA[0] * canvasToImageScaleX, imgHeight - pdfPosA[1] * canvasToImageScaleY);
          const pixelPosB = fromValues(pdfPosB[0] * canvasToImageScaleX, imgHeight - pdfPosB[1] * canvasToImageScaleY);
          const pixelLength = dist(pixelPosA, pixelPosB);
          const modelLength = dist(modelPosA, modelPosB);
          const modelDir = sub(create(), modelPosB, modelPosA);
          normalize(modelDir, modelDir);
          const pixDir = sub(create(), pixelPosA, pixelPosB);
          normalize(pixDir, pixDir);
          const scale = modelLength / pixelLength;
          const angleAroundZ = 1 + dot(modelDir, pixDir);
          const pdfToWorldScale = imgHeight * scale;
          const translation = sub(create(), modelPosA, fromValues(pixelPosA[0] * scale, pixelPosA[1] * scale));

          // logs
          console.log("angleAroundZ", angleAroundZ);
          console.log("pdfToWorldScale ", pdfToWorldScale);
          console.log("translation ", translation);

          // calculations to show in info pane
          const calculations = { angleAroundZ, pdfToWorldScale, translation };
          openInfoPane(calculations, "PDF Transformation");
        }
      }
    }
  };

  // Create a bitmap context to display render output
  const ctx = canvas.getContext("bitmaprenderer");

  // runs resizeObserver for main canvas (3D view), just to update width/height.
  runResizeObserver(view, canvas);

  // resizeObserver for preview canvas (right-side) to re-draw images/arc or update size on pane resizes.
  new ResizeObserver((entries) => {
    for (const { contentRect } of entries) {
      const scaledWidth = contentRect.width / previewCanvasWidth;
      const scaledHeight = contentRect.height / previewCanvasHeight;
      if (pdfPosA) {
        updatedPdfPosA = glMatrix.vec2.fromValues(scaledWidth * pdfPosA[0], scaledHeight * pdfPosA[1]);
      }
      if (pdfPosB) {
        updatedPdfPosB = glMatrix.vec2.fromValues(scaledWidth * pdfPosB[0], scaledHeight * pdfPosB[1]);
      }
      if (preview && previewCanvasContext2D) {
        const img = new Image();
        img.onload = () => {
          if (previewCanvasContext2D && preview) {
            previewCanvasContext2D.clearRect(0, 0, contentRect.width, contentRect.height);
            // Redraw the image to the preview canvas
            previewCanvasContext2D.drawImage(img, 0, 0, contentRect.width, contentRect.height);
            if (updatedPdfPosA) {
              drawArc(previewCanvasContext2D, updatedPdfPosA[0], updatedPdfPosA[1], "green");
            }
            if (updatedPdfPosB) {
              drawArc(previewCanvasContext2D, updatedPdfPosB[0], updatedPdfPosB[1], "blue");
            }
          }
        };
        img.src = preview;
      }
    }
  }).observe(previewCanvas);

  // render loop
  while (true) {
    // Render frame
    currentOutput = await view.render();
    {
      // Finalize output image
      const image = await currentOutput.getImage();
      if (image) {
        // Display the given ImageBitmap in the canvas associated with this rendering context.
        ctx?.transferFromImageBitmap(image);
        // release bitmap data
        image.close();
      }
    }
    if (posA && posB) {
      draw = _measureApi.getDrawObjectFromPoints(view, [posA, posB], false, false);
    } else if (posA) {
      draw = _measureApi.getDrawObjectFromPoints(view, [posA], false, false);
    }
    await drawProduct(context2D, draw, 3, canvas2D);
    (currentOutput as any).dispose();
  }
}

async function getElevation(scene: Scene): Promise<number | undefined> {
  try {
    const iterator = scene.search(
      {
        searchPattern: [{ property: "IfcClass", value: "IfcBuildingStorey", exact: true }],
      },
      undefined
    );
    const iteratorResult = await iterator.next();
    const data = await iteratorResult.value.loadMetaData();
    for (const prop of data.properties) {
      if (prop[0] === "Novorender/Elevation") {
        return Number(prop[1]);
      }
    }
    return undefined;
  } catch (error) {
    console.log(error);
  }
}

async function downloadPdfPreview(scene: SceneData): Promise<string | undefined> {
  if (scene.db) {
    // perform a db search to get the metadata
    const iterator = scene.db.search(
      {
        searchPattern: [{ property: "Novorender/Document/Preview", exact: true }],
      },
      undefined
    );
    const iteratorResult = await iterator.next();
    const data = await iteratorResult.value.loadMetaData();
    for (const prop of data.properties) {
      if (prop[0] === "Novorender/Document/Preview") {
        //This is the PDF image
        return prop[1];
      }
    }
  }
  return undefined;
}

// HiddenRangeStarted
function showErrorDetails(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D | null, error: string) {
  ctx!.font = "18px Arial";
  ctx!.fillStyle = "red";
  ctx!.textAlign = "center";
  ctx!.fillText(`Failed to load the PDF Preview.`, canvas.width / 2, canvas.height / 2);
  ctx!.fillText(`Error: ${error}`, canvas.width / 2, canvas.height / 1.8);
}

async function initView(webglApi: typeof WebglApi, canvas: HTMLCanvasElement, pdfScene: SceneData, renderSettings: RecursivePartial<RenderSettings>): Promise<View> {
  // Destructure relevant properties into variables
  const { settings } = pdfScene;

  // initialize the webgl api
  const api = webglApi.createAPI();

  // Load scene
  const scene = await api.loadScene(WebglApi.WellKnownSceneUrls.condos);

  // Create a view with the scene's saved settings
  const view = await api.createView(settings, canvas);

  view.applySettings(renderSettings);

  //set up camera controller
  const orthoController = api.createCameraController({ kind: "ortho" }, canvas);
  (orthoController as any).init([750, 18, -180], [0, 0, 0], view.camera);
  (orthoController.params as OrthoControllerParams).referenceCoordSys = [1, 0, 0, 0, 0, 0, -1, 0, 0, 1, 0, 0, 728, 7, -230, 1];
  (orthoController.params as OrthoControllerParams).fieldOfView = 35;
  view.camera.controller = orthoController;

  // Assign the scene to the view
  view.scene = scene;

  return view;
}

async function runResizeObserver(view: View, canvas: HTMLCanvasElement): Promise<void> {
  // Handle canvas resizes
  new ResizeObserver((entries) => {
    for (const { target, contentRect } of entries) {
      canvas.width = contentRect.width;
      canvas.height = contentRect.height;
      view.applySettings({
        display: { width: canvas.width, height: canvas.height },
      });
    }
  }).observe(canvas);
}

// Below are utility functions copied from our frontend (https://github.com/novorender/novoweb/blob/develop/src/features/engine2D/utils.ts)
interface ColorSettings {
  lineColor?: string | CanvasGradient;
  fillColor?: string;
  pointColor?: string | { start: string; middle: string; end: string };
  outlineColor?: string;
  complexCylinder?: boolean;
}

function drawProduct(context2D: CanvasRenderingContext2D | null, product: DrawProduct | undefined, pixelWidth: number, canvas2D: HTMLCanvasElement): void {
  if (product) {
    if (context2D) {
      context2D.clearRect(0, 0, canvas2D.width, canvas2D.height);
      for (const obj of (product as DrawProduct).objects) {
        obj.parts.forEach((part) => {
          drawPart(context2D, part, pixelWidth);
        });
      }
    }
  }
}

function drawPart(ctx: CanvasRenderingContext2D, part: DrawPart, pixelWidth: number): void {
  if (part.vertices2D) {
    ctx.lineWidth = pixelWidth;
    drawPoints(ctx, part);
  }
}

function drawPoints(ctx: CanvasRenderingContext2D, part: DrawPart): void {
  const colorSettings: Array<ColorSettings> = [
    { fillColor: "green", outlineColor: "green", lineColor: "green" },
    { fillColor: "blue", outlineColor: "blue", lineColor: "blue" },
  ];

  if (part.vertices2D) {
    for (let i = 0; i < part.vertices2D.length; ++i) {
      drawArc(ctx, part.vertices2D[i][0], part.vertices2D[i][1], colorSettings[i].fillColor as string);
    }
  }
}

function drawArc(ctx: CanvasRenderingContext2D, x: number, y: number, fillStyle: string): void {
  ctx.fillStyle = fillStyle;
  ctx.lineWidth = 2;
  ctx.strokeStyle = "black";
  ctx.beginPath();
  ctx.arc(x, y, 5, 0, 2 * Math.PI);
  ctx.fill();
  ctx.stroke();
}
// HiddenRangeEnded
