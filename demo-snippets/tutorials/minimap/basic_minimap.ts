// HiddenRangeStarted
import * as WebglApi from "@novorender/webgl-api";
import * as MeasureApi from "@novorender/measure-api";
import * as DataJsApi from "@novorender/data-js-api";
import * as GlMatrix from "gl-matrix";
import type { API, RecursivePartial, RenderSettings, RenderOutput, View, OrthoControllerParams, Scene, SearchPattern, HierarcicalObjectReference } from "@novorender/webgl-api";
import type { SceneData } from "@novorender/data-js-api";
import type { DrawPart, DrawProduct } from "@novorender/measure-api";
import type { vec2, ReadonlyVec3, vec3, quat } from "gl-matrix";

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

  let animationFrameId = -1;

  let prevCamPos: vec3;
  let prevCamRot: quat;

  function animate() {
    // Run every frame to check if the camera has changed
    if (
      !prevCamRot ||
      !glMatrix.quat.exactEquals(prevCamRot, view.camera.rotation) ||
      !prevCamPos ||
      !glMatrix.vec3.exactEquals(prevCamPos, view.camera.position)
    ) {
      prevCamRot = glMatrix.quat.clone(view.camera.rotation);
      prevCamPos = glMatrix.vec3.clone(view.camera.position);
      if (minimap && ctx) {
        //Update minimap info based on camera position. Returns true if it changed the pdf to another floor
        minimap.update(view.camera.position as vec3);
        const img = new Image();
        img.onload = function () {
          if (ctx && minimap) {
            //Redraw the image for te minimap
            // ctx.clearRect(0, 0, width / 2, height);

            //ctx.drawImage(img, 450, 200, img.width * 0.7, img.height * 0.7, 0, 0, width, height);
            // ctx.drawImage(img, 300, 0, img.width, img.height, 0, 0, img.width * 1.5, img.height * 1.5);

            //Gets the camera position in minimap space
            const minimapPos = minimap.toMinimap(view.camera.position as vec3);
            minimapPos[0] -= 300 * 1.5;
            //minimapPos[1] -= 200;
            //Gets a cone of the camera direction in minimap space, point[0] is the camera position
            const dirPath = minimap.directionPoints(view.camera.position as vec3, view.camera.rotation as quat);

            const ctx = canvas.getContext("2d");

            ctx!.strokeStyle = "green";
            for (let i = 1; i < dirPath.length; ++i) {
              ctx!.beginPath();
              ctx!.lineWidth = 3;
              ctx!.moveTo(dirPath[0][0] - 300 * 1.5, dirPath[0][1]);
              ctx!.lineTo(dirPath[i][0] - 300 * 1.5, dirPath[i][1]);
              ctx!.stroke();
            }
            ctx!.fillStyle = "green";
            ctx!.beginPath();
            ctx!.ellipse(minimapPos[0], minimapPos[1], 5, 5, 0, 0, Math.PI * 2);
            ctx!.fill();
          }
        };
        // img.src = minimap.getMinimapImage();
      }
    }

    animationFrameId = requestAnimationFrame(() => animate());
  }

  const previewCanvasContext2D = previewCanvas.getContext("2d");
  let preview: string | undefined;
  let minimap: MinimapHelper;
  if (pdfScene && !(pdfScene as any).error) {
    minimap = await downloadMinimap(pdfScene, glMatrix);
    console.log('minimap ==> ', minimap);

    preview = minimap.getMinimapImage();

    console.log("preview image ", preview);

    try {
      const img = await loadImage(preview);
      minimap.pixelWidth = canvas.width; // Set canvas width
      minimap.pixelHeight = canvas.height; // Set canvas height in minimap helper
      if (previewCanvasContext2D) {
        previewCanvasContext2D.drawImage(img, 0, 0, previewCanvas.width, previewCanvas.height);
      }
    } catch (error) {
      console.error('Failed to load the preview image ', error);
    }

  }

  // if (preview) {
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

  // try {
  //   const initialImage = await loadImage(preview);
  //   minimap.pixelHeight = img.height * 1.5; //Set canvas height in minimap helper
  //   minimap.pixelWidth = img.width * 1.5; //Set canvas w
  //   if (previewCanvasContext2D) {
  //     previewCanvasContext2D.drawImage(initialImage, 0, 0, previewCanvas.width, previewCanvas.height);
  //   }
  // } catch (error) {
  //   console.error('Failed to load the preview image ', error);
  // }
  // } else {
  // just to show error details on previewCanvas, if preview failed to load
  // showErrorDetails(previewCanvas, previewCanvasContext2D, (pdfScene as any).error);
  // }

  /** vars for 3D view click listener */
  const context2D = canvas2D.getContext("2d");
  let currentOutput: RenderOutput;
  let selectEntity: 1 | 2 = 1;
  let posA: ReadonlyVec3 | undefined;
  let posB: ReadonlyVec3 | undefined;
  let draw: MeasureApi.DrawProduct | undefined;
  /** END */

  // 3D view click listener
  // canvas.onclick = async (e: MouseEvent) => {
  //   if (currentOutput) {
  //     const pickInfo = await currentOutput.pick(e.offsetX, e.offsetY);
  //     if (pickInfo) {
  //       if (selectEntity === 1) {
  //         posA = pickInfo.position;
  //         selectEntity = 2;
  //       } else {
  //         posB = pickInfo.position;
  //         selectEntity = 1;
  //       }
  //       if (posA && posB) {
  //         draw = _measureApi.getDrawObjectFromPoints(view, [posA, posB], false, false);
  //       } else if (posA) {
  //         draw = _measureApi.getDrawObjectFromPoints(view, [posA], false, false);
  //       }
  //       await drawProduct(context2D, draw, 3, canvas2D);
  //     }
  //   }
  // };

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
    currentLevel = Math.ceil(wheelDelta);

    if (currentLevel === 1) { // reset the quadtree
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

    previousArea = area;
    view.camera.controller.moveTo(minimap.toWorld(glMatrix.vec2.fromValues(area.x, area.y)), view.camera.rotation);

    console.log('minimap.toWorld(glMatrix.vec2.fromValues(area.x, area.y)) ', minimap.toWorld(glMatrix.vec2.fromValues(area.x, area.y)));

    // animate();

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

// function showErrorDetails(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D | null, error: string) {
//   ctx!.font = "18px Arial";
//   ctx!.fillStyle = "red";
//   ctx!.textAlign = "center";
//   ctx!.fillText(`Failed to load the PDF Preview.`, canvas.width / 2, canvas.height / 2);
//   ctx!.fillText(`Error: ${error}`, canvas.width / 2, canvas.height / 1.8);
// }

async function initView(webglApi: typeof WebglApi, canvas: HTMLCanvasElement, pdfScene: SceneData, renderSettings: RecursivePartial<RenderSettings>): Promise<View> {
  // Destructure relevant properties into variables
  const { settings, camera: cameraParams } = pdfScene;

  // initialize the webgl api
  const api = webglApi.createAPI();

  // Load scene
  const scene = await api.loadScene(WebglApi.WellKnownSceneUrls.condos);

  // Create a view with the scene's saved settings
  const view = await api.createView(settings, canvas);

  view.applySettings(renderSettings);

  // set up camera controller
  // const orthoController = api.createCameraController({ kind: "flight" }, canvas);
  // (orthoController as any).init([750, 18, -180], [0, 0, 0], view.camera);
  // (orthoController.params as OrthoControllerParams).referenceCoordSys = [1, 0, 0, 0, 0, 0, -1, 0, 0, 1, 0, 0, 728, 7, -230, 1];
  // (orthoController.params as OrthoControllerParams).fieldOfView = 35;
  // view.camera.controller = orthoController;
  // Create a camera controller with the saved parameters with ortho as fallback
  const camera = cameraParams ?? ({ kind: "ortho" } as any);
  view.camera.controller = api.createCameraController(camera, canvas);

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



/**
 * *****************************************************************************************************
 * *****************************************************************************************************
 * MINIMAP CLASS & HELPERS
 * *****************************************************************************************************
 * *****************************************************************************************************
 */

interface MinimapInfo {
  aspect: number;
  elevation: number;
  image: string;
  corner: vec3;
  dx: number;
  dy: number;
  dirX: vec3;
  dirY: vec3;
}

export class MinimapHelper {
  pixelWidth = 0;
  pixelHeight = 0;
  currentIndex = 0;

  glMatrix: typeof GlMatrix;

  constructor(readonly minimaps: MinimapInfo[], glMatrix: typeof GlMatrix) {
    this.glMatrix = glMatrix;
  }
  toMinimap(worldPos: vec3): vec2 {
    const curInfo = this.getCurrentInfo();
    const diff = this.glMatrix.vec3.sub(this.glMatrix.vec3.create(), worldPos, curInfo.corner);
    const diffX = this.glMatrix.vec3.dot(diff, curInfo.dirX);
    const diffY = this.glMatrix.vec3.dot(diff, curInfo.dirY);
    const x = (diffX / curInfo.dx) * this.pixelWidth;
    const y = this.pixelHeight - (diffY / curInfo.dy) * this.pixelHeight;
    return this.glMatrix.vec2.fromValues(x, y);
  }

  toWorld(minimapPos: vec2): vec3 {
    const curInfo = this.getCurrentInfo();
    const diffX = minimapPos[0] / this.pixelWidth;
    const diffY = 1 - minimapPos[1] / this.pixelHeight;
    const pos = this.glMatrix.vec3.clone(curInfo.corner);
    pos[1] += 0.75;
    this.glMatrix.vec3.scaleAndAdd(pos, pos, curInfo.dirX, curInfo.dx * diffX);
    this.glMatrix.vec3.scaleAndAdd(pos, pos, curInfo.dirY, curInfo.dy * diffY);
    return pos;
  }

  directionPoints(worldPos: vec3, rot: quat): vec2[] {
    const path: vec2[] = [];
    path.push(this.toMinimap(worldPos));
    const rotA = this.glMatrix.quat.rotateY(this.glMatrix.quat.create(), rot, Math.PI / 8);
    const dirZ = this.glMatrix.vec3.fromValues(0, 0, -1);
    const dirA = this.glMatrix.vec3.transformQuat(this.glMatrix.vec3.create(), dirZ, rotA);
    const posA = this.glMatrix.vec3.scaleAndAdd(this.glMatrix.vec3.create(), worldPos, dirA, 10);
    path.push(this.toMinimap(posA));

    const rotB = this.glMatrix.quat.rotateY(this.glMatrix.quat.create(), rot, -Math.PI / 8);
    const dirB = this.glMatrix.vec3.transformQuat(this.glMatrix.vec3.create(), dirZ, rotB);
    const posB = this.glMatrix.vec3.scaleAndAdd(this.glMatrix.vec3.create(), worldPos, dirB, 10);
    path.push(this.toMinimap(posB));

    return path;
  }

  getCurrentInfo() {
    return this.minimaps[this.currentIndex];
  }

  getMinimapImage() {
    return this.getCurrentInfo().image;
  }

  getAspect() {
    return this.getCurrentInfo().aspect;
  }

  update(camPos: vec3): boolean {
    for (let i = 1; i < this.minimaps.length; ++i) {
      if (camPos[1] - 0.5 < this.minimaps[i].elevation) {
        if (i !== this.currentIndex) {
          this.currentIndex = i - 1;
          return true;
        }
        return false;
      }
    }
    if (this.currentIndex !== this.minimaps.length - 1) {
      this.currentIndex = this.minimaps.length - 1;
      return true;
    }
    return false;
  }
}


async function downloadMinimap(scene: SceneData, glMatrix: typeof GlMatrix): Promise<MinimapHelper> {

  const minimaps: MinimapInfo[] = [];

  // perform a db search to get the metadata
  const iterator = scene?.db?.search(
    {
      searchPattern: [{ property: "Novorender/Document/Preview", exact: true }],
    },
    undefined
  );
  const iteratorResult = await iterator?.next();
  const data = await iteratorResult?.value.loadMetaData();

  let corner = glMatrix.vec3.create();
  const dirX = glMatrix.vec3.create();
  const dirY = glMatrix.vec3.create();
  let dx = 0;
  let dy = 0;
  let aspect = 0;
  let elevation = 0;
  let image = "";
  for (const prop of data.properties) {
    if (prop[0] === "Novorender/Document/Corners") {
      const points = prop[1].split("]");
      const c1 = points[0].replaceAll("[", "").split(",");
      const c2 = points[1].replaceAll("[", "").split(",");
      const c3 = points[2].replaceAll("[", "").split(",");
      const a = glMatrix.vec3.fromValues(Number(c1[0]), Number(c1[1]), Number(c1[2]));
      const b = glMatrix.vec3.fromValues(Number(c2[1]), Number(c2[2]), Number(c2[3]));
      const c = glMatrix.vec3.fromValues(Number(c3[1]), Number(c3[2]), Number(c3[3]));
      glMatrix.vec3.sub(dirX, b, a);
      dx = glMatrix.vec3.len(dirX);
      glMatrix.vec3.normalize(dirX, dirX);
      glMatrix.vec3.sub(dirY, c, b);
      dy = glMatrix.vec3.len(dirY);
      glMatrix.vec3.normalize(dirY, dirY);
      corner = glMatrix.vec3.clone(a);
      elevation = a[1];
      aspect = dx / dy;
    } else if (prop[0] === "Novorender/Document/Preview") {
      const url = new URL((scene as any).url);
      url.pathname += prop[1];
      // This is the PDF image URL
      image = url.toString();
    }
  }
  minimaps.push({
    aspect,
    image,
    dx,
    dy,
    corner,
    dirX,
    dirY,
    elevation,
  });

  minimaps.sort((a, b) => a.elevation - b.elevation);
  return new MinimapHelper(minimaps, glMatrix);
}

/**
 * *****************************************************************************************************
 * *****************************************************************************************************
 * END OF MINIMAP CLASS & HELPERS
 * *****************************************************************************************************
 * *****************************************************************************************************
 */

