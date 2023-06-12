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
// export function showTip() {
//   return openAlert("Choose 2 points from the 3D view (on the left) and 2 points from the PDF view (on the right), both in the identical locations, to show the computations.");
// }
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
    // const img = new Image();

    // img.onload = () => {
    //   // Calculate the scaling factor for the image
    //   var scale = Math.min(previewCanvas.width / img.width, previewCanvas.height / img.height);

    //   // Calculate the new dimensions for the image
    //   var scaledWidth = img.width * scale;
    //   var scaledHeight = img.height * scale;

    //   // Calculate the position to center the image within the previewCanvas
    //   var offsetX = (previewCanvas.width - scaledWidth) / 2;
    //   var offsetY = (previewCanvas.height - scaledHeight) / 2;

    //   if (previewCanvasContext2D) {
    //     previewCanvasContext2D.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight);
    //   }
    // };
    // img.src = preview as string;

    try {
      const initialImage = await loadImage(preview);
      if (previewCanvasContext2D) {
        previewCanvasContext2D.drawImage(initialImage, 0, 0, previewCanvas.width, previewCanvas.height);
      }
    } catch (error) {
      console.error('Failed to load the preview image ', error);
    }
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

  // create tree
  const quadTree = new Quadtree({
    // tree width/height will be 50% bigger than the actual canvas size because we need to exclude some quads that are out of bounds (11, 13, 22, 23, 31, 32, 33)
    width: previewCanvas.width + previewCanvas.width / 2,
    height: previewCanvas.height + previewCanvas.height / 2,
    x: 0,
    y: 0,
    Id: 'root',
  });

  // split tree
  quadTree.split();

  console.log('quadTree ', quadTree);


  let wheelDelta = 1,
    level: number,
    currentLevel = 1,
    previousArea: Rectangle | undefined;

  previewCanvas.onwheel = async (e) => {
    e.preventDefault();

    wheelDelta += e.deltaY * -0.01;
    wheelDelta = Math.min(Math.max(1, wheelDelta), 5);
    // console.log('wheelde ', wheelDelta);
    currentLevel = Math.ceil(wheelDelta);
    if (currentLevel === 1) {
      level = 1;
      try {
        const initialImage = await loadImage(preview as string);
        if (previewCanvasContext2D) {
          previewCanvasContext2D.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
          previewCanvasContext2D.drawImage(initialImage, 0, 0, previewCanvas.width, previewCanvas.height);
        }
      } catch (error) {
        console.error('Failed to load the preview image ', error);
      }
      previousArea = undefined;
      return;
    }
    if (level === currentLevel) {
      return;
    }
    level = currentLevel;

    // Get the position of the click relative to the canvas
    const rect = previewCanvas.getBoundingClientRect();
    let centerX = e.clientX - rect.left;
    let centerY = e.clientY - rect.top;

    const width = previewCanvas.width / currentLevel;
    const height = previewCanvas.height / currentLevel;
    if (previousArea) {
      const previousAreaMinX = previousArea.x;
      const previousAreaMinY = previousArea.y;
      centerX = previousAreaMinX + centerX / currentLevel;
      centerY = previousAreaMinY + centerY / currentLevel;
    }

    const area = new Rectangle({
      x: Math.max(0, centerX - width / 2),
      y: Math.max(0, centerY - height / 2),
      width: width,
      height: height,
    });

    // console.log('initial area', area);

    previousArea = area;

    let elements = quadTree.retrieve(previousArea, currentLevel);
    // filter-out unnecessary quads that are out of bounds of canvas
    const outOfBoundsQuads = ['11', '13', '22', '23', '31', '32', '33'];
    elements = elements.filter((e) => {
      for (const quad of outOfBoundsQuads) {
        if (e.Id.startsWith(quad)) {
          return false;
        }
      }
      return true;
    });

    // elements.sort((a, b) => a.bounds.y - b.bounds.y);

    console.log(`elements for level ${currentLevel} ==> `, elements);

    previewCanvasContext2D!.clearRect(0, 0, previewCanvas.width, previewCanvas.height);


    // Loop through the found nodes and draw images based on node on the canvas
    for (let i = 0; i < elements.length; i++) {
      const node = elements[i];

      let nodeBoundsWidth = node.bounds.width;
      let nodeBoundsHeight = node.bounds.height;

      // // divide initial levels bounds width/height
      // // because the actual tree is bigger than
      // // the canvas size
      // if (node.level === 1) {
      //   switch (node.Id) {
      //     case '1':
      //       nodeBoundsWidth = nodeBoundsWidth / 2;
      //       break;
      //     case '2':
      //       nodeBoundsHeight = nodeBoundsHeight / 2;
      //       break;
      //     case '3':
      //       nodeBoundsWidth = nodeBoundsWidth / 2;
      //       nodeBoundsHeight = nodeBoundsHeight / 2;
      //       break;
      //   }
      // }

      try {
        const loadedImage = await loadImage(preview as string, node.Id);
        const boundsWRatio = loadedImage.naturalWidth / nodeBoundsWidth;
        const boundsHRatio = loadedImage.naturalHeight / nodeBoundsHeight;
        const cutLeft = Math.max(0, area.x - node.bounds.x);
        const cutRight = Math.max(0, node.bounds.x + node.bounds.width - (area.x + area.width));
        const cutX = cutLeft + cutRight;
        const cutTop = Math.max(0, area.y - node.bounds.y);
        const cutBot = Math.max(0, node.bounds.y + node.bounds.height - (area.y + area.height));
        const cutY = cutTop + cutBot;

        const zoom = currentLevel;
        const x = (Math.max(node.bounds.x, area.x) - area.x) * zoom;
        const y = (Math.max(node.bounds.y, area.y) - area.y) * zoom;

        let sx = cutLeft * boundsWRatio;
        let sy = cutTop * boundsHRatio;
        const sWidth = loadedImage.naturalWidth - sx - cutRight * boundsWRatio;
        const sHeight = loadedImage.naturalHeight - sy - cutBot * boundsHRatio;
        const dWidth = (node.bounds.width - cutX) * zoom;
        const dHeight = (node.bounds.height - cutY) * zoom;

        previewCanvasContext2D!.drawImage(
          loadedImage,
          sx,
          sy,
          sWidth,
          sHeight,
          x,
          y,
          dWidth,
          dHeight
        );
      } catch (err) {
        console.error('Something went wrong', err);
      }
    }
  };

  // Preview Canvas (right-side) click listener
  // previewCanvas.onclick = (e: MouseEvent) => {
  //   // destructure necessary glMatrix functions
  //   const {
  //     vec2: { fromValues, dist, sub, create, normalize, dot },
  //   } = glMatrix;

  //   if (previewCanvas && preview && previewCanvasContext2D) {
  //     // check if positions were updated via pane resizes
  //     // not necessary if you don't resize pane/canvas
  //     if (updatedPdfPosA) {
  //       pdfPosA = updatedPdfPosA;
  //       updatedPdfPosA = null;
  //     }
  //     if (updatedPdfPosB) {
  //       pdfPosB = updatedPdfPosB;
  //       updatedPdfPosB = null;
  //     }

  //     previewCanvasWidth = previewCanvas.width;
  //     previewCanvasHeight = previewCanvas.height;

  //     const x = e.offsetX;
  //     const y = e.offsetY;

  //     if (selectingA) {
  //       pdfPosA = fromValues(x, y);
  //     } else {
  //       pdfPosB = fromValues(x, y);
  //     }
  //     selectingA = !selectingA;
  //     if (preview && previewCanvasContext2D) {
  //       const img = new Image();
  //       img.onload = () => {
  //         if (previewCanvasContext2D && preview) {
  //           // Redraw the image to the preview canvas
  //           previewCanvasContext2D.clearRect(0, 0, previewCanvasWidth, previewCanvasHeight);
  //           previewCanvasContext2D.drawImage(img, 0, 0, previewCanvasWidth, previewCanvasHeight);
  //           imgHeight = img.height;
  //           imgWidth = img.width;
  //           if (pdfPosA) {
  //             drawArc(previewCanvasContext2D, pdfPosA[0], pdfPosA[1], "green");
  //           }
  //           if (pdfPosB) {
  //             drawArc(previewCanvasContext2D, pdfPosB[0], pdfPosB[1], "blue");
  //           }
  //         }
  //       };
  //       img.src = preview;
  //     }
  //     if (posA && posB && draw) {
  //       if (pdfPosA && pdfPosB) {
  //         const modelPosA = fromValues(posA[0], posA[2] * -1);
  //         const modelPosB = fromValues(posB[0], posB[2] * -1);
  //         const canvasToImageScaleX = imgWidth / previewCanvasWidth;
  //         const canvasToImageScaleY = imgHeight / previewCanvasHeight;
  //         //Invert Y axis on the pixel positions on the pdf image
  //         const pixelPosA = fromValues(pdfPosA[0] * canvasToImageScaleX, imgHeight - pdfPosA[1] * canvasToImageScaleY);
  //         const pixelPosB = fromValues(pdfPosB[0] * canvasToImageScaleX, imgHeight - pdfPosB[1] * canvasToImageScaleY);
  //         const pixelLength = dist(pixelPosA, pixelPosB);
  //         const modelLength = dist(modelPosA, modelPosB);
  //         const modelDir = sub(create(), modelPosB, modelPosA);
  //         normalize(modelDir, modelDir);
  //         const pixDir = sub(create(), pixelPosA, pixelPosB);
  //         normalize(pixDir, pixDir);
  //         const scale = modelLength / pixelLength;
  //         const radAroundZ = Math.acos(dot(modelDir, pixDir)) * -1;
  //         const degreesAroundZ = (radAroundZ / Math.PI) * 180;
  //         const pdfToWorldScale = imgHeight * scale;
  //         const translation = sub(create(), modelPosA, fromValues(pixelPosA[0] * scale * Math.cos(radAroundZ), pixelPosA[1] * scale * Math.sin(radAroundZ)));

  //         // calculations to show/log in the info pane
  //         const calculations = { radians: radAroundZ, degrees: degreesAroundZ, pdfToWorldScale, translation };
  //         openInfoPane(calculations, "PDF Transformation");
  //       }
  //     }
  //   }
  // };

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

        loadImage(preview)
          .then(img => {
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
          })
          .catch(err => console.log('Failed to load the preview image ', err));
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
        const url = new URL((scene as any).url);
        url.pathname += prop[1];
        // This is the PDF image URL
        return url.toString();
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
  pointColor?: string | { start: string; middle: string; end: string; };
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


// Function to load an image
function loadImage(url: string, id?: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = id ? url.replace(/(\.jpeg)/, `_${id}$1`) : url;
  });
}

/**
 * *****************************************************************************************************
 * *****************************************************************************************************
 * QUAD TREE CLASS & HELPERS
 * *****************************************************************************************************
 * *****************************************************************************************************
 */

/**
 * Class representing a Quadtree node.
 *
 * @example
 * ```typescript
 * const tree = new Quadtree({
 *   width: 100,
 *   height: 100,
 *   x: 0,           // optional, default:  0
 *   y: 0,           // optional, default:  0
 * });
 * ```
 */
export class Quadtree {
  /**
   * The numeric boundaries of this node.
   * @readonly
   */
  bounds: NodeGeometry;

  /**
   * The level of this node.
   * @defaultValue `0`
   * @readonly
   */
  level: number;

  /**
   * Subnodes of this node
   * @defaultValue `[]`
   * @readonly
   */
  nodes: Quadtree[];

  Id: string;

  /**
   * Quadtree Constructor
   * @param props - bounds and properties of the node
   * @param level - depth level (internal use only, required for subnodes)
   */
  constructor(props: QuadtreeProps, level = 0) {
    this.bounds = {
      x: props.x || 0,
      y: props.y || 0,
      width: props.width,
      height: props.height,
    };
    this.level = level;
    this.nodes = [];
    this.Id = props.Id;
  }

  /**
   * Get the quadrant (subnode indexes) an object belongs to.
   *
   * @example
   * ```typescript
   * const tree = new Quadtree({ width: 100, height: 100 });
   * const rectangle = new Rectangle({ x: 25, y: 25, width: 10, height: 10 });
   * const indexes = tree.getIndex(rectangle);
   * console.log(indexes); // [1]
   * ```
   *
   * @param obj - object to be checked
   * @returns Array containing indexes of intersecting subnodes (0-3 = top-right, top-left, bottom-left, bottom-right).
   */
  getIndex(obj: Rectangle | Indexable): number[] {
    return obj.qtIndex(this.bounds);
  }

  /**
   * Split the node into 4 subnodes.
   * @internal
   *
   * @example
   * ```typescript
   * const tree = new Quadtree({ width: 100, height: 100 });
   * tree.split();
   * console.log(tree); // now tree has four subnodes
   * ```
   */
  split(): void {
    const level = this.level + 1;

    const width = this.bounds.width / 2,
      height = this.bounds.height / 2,
      x = this.bounds.x,
      y = this.bounds.y;

    // max 5 levels
    if (level > 5) {
      return;
    }

    const coords = [
      { x: x, y: y },
      { x: x + width, y: y },
      { x: x, y: y + height },
      { x: x + width, y: y + height },
    ];
    let _id;
    for (let i = 0; i < 4; i++) {

      if (this.Id === 'root' && level === 0) {
        _id = 'root';
      } else if (level === 1) {
        _id = i.toString();
      } else {
        _id = this.Id + i.toString();
      }

      this.nodes[i] = new Quadtree(
        {
          x: coords[i].x,
          y: coords[i].y,
          width,
          height,
          Id: _id,
        },
        level
      );

      this.nodes[i].split();
    }
  }

  /**
   * Return all objects that could collide with the given geometry.
   *
   * @example
   * ```typescript
   * tree.retrieve(new Rectangle({ x: 25, y: 25, width: 10, height: 10, data: 'data' }));
   * ```
   *
   * @param obj - geometry to be checked
   * @returns Array containing all detected objects.
   */
  retrieve(obj: Rectangle | Indexable, testLevel: number): Quadtree[] {
    const indexes = this.getIndex(obj);

    let returnObjects: Quadtree[] = [];

    //if we have subnodes, retrieve their objects
    if (this.nodes.length && this.level < testLevel) {
      for (let i = 0; i < indexes.length; i++) {
        returnObjects = returnObjects.concat(
          this.nodes[indexes[i]].retrieve(obj, testLevel)
        );
      }
    } else {
      returnObjects.push(this);
    }
    return returnObjects;
  }
}

/**
 * Class representing a Rectangle
 *
 * @example
 * ```typescript
 * const rectangle = new Rectangle({
 *   x: 10,
 *   y: 20,
 *   width: 30,
 *   height: 40,
 * });
 * ```
 */
export class Rectangle
  implements NodeGeometry, Indexable {
  /**
   * X start of the rectangle (top left).
   */
  x: number;

  /**
   * Y start of the rectangle (top left).
   */
  y: number;

  /**
   * Width of the rectangle.
   */
  width: number;

  /**
   * Height of the rectangle.
   */
  height: number;

  constructor(props: NodeGeometry) {
    this.x = props.x;
    this.y = props.y;
    this.width = props.width;
    this.height = props.height;
  }

  /**
   * Determine which quadrant this rectangle belongs to.
   * @param node - Quadtree node to be checked
   * @returns Array containing indexes of intersecting subnodes (0-3 = top-right, top-left, bottom-left, bottom-right)
   */
  qtIndex(node: NodeGeometry): number[] {

    const indexes: number[] = [];
    let boundsCenterX, boundsCenterY;

    boundsCenterX = node.x + node.width / 2;
    boundsCenterY = node.y + node.height / 2;

    const startIsNorth = this.y < boundsCenterY,
      startIsWest = this.x < boundsCenterX,
      endIsEast = this.x + this.width > boundsCenterX,
      endIsSouth = this.y + this.height > boundsCenterY;

    //top-left quad
    if (startIsWest && startIsNorth) {
      indexes.push(0);
    }

    //top-right quad
    if (startIsNorth && endIsEast) {
      indexes.push(1);
    }

    //bottom-left quad
    if (startIsWest && endIsSouth) {
      indexes.push(2);
    }

    //bottom-right quad
    if (endIsEast && endIsSouth) {
      indexes.push(3);
    }

    return indexes;
  }
}

/**
 * Quadtree Constructor Properties
 */
export interface QuadtreeProps {
  /**
   * Width of the node.
   */
  width: number;

  /**
   * Height of the node.
   */
  height: number;

  /**
   * X Offset of the node.
   * @defaultValue `0`
   */
  x?: number;

  /**
   * Y Offset of the node.
   * @defaultValue `0`
   */
  y?: number;

  Id: string;
}

/**
 * All shape classes must implement this interface.
 */
export interface Indexable {
  /**
   * This method is called on all objects that are inserted into or retrieved from the Quadtree.
   * It must determine which quadrant an object belongs to.
   * @param node - Quadtree node to be checked
   * @returns Array containing indexes of intersecting subnodes (0-3 = top-right, top-left, bottom-left, bottom-right)
   */
  qtIndex(node: NodeGeometry): number[];
}

/**
 * Interface for geometry of a Quadtree node
 */
export interface NodeGeometry {
  /**
   * X position of the node
   */
  x: number;

  /**
   * Y position of the node
   */
  y: number;

  /**
   * Width of the node
   */
  width: number;

  /**
   * Height of the node
   */
  height: number;
}

/**
 * *****************************************************************************************************
 * *****************************************************************************************************
 * END OF QUAD TREE CLASS & HELPERS
 * *****************************************************************************************************
 * *****************************************************************************************************
 */

// HiddenRangeEnded
