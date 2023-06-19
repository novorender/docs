// HiddenRangeStarted
import * as WebglApi from "@novorender/webgl-api";
import * as MeasureApi from "@novorender/measure-api";
import * as DataJsApi from "@novorender/data-js-api";
import * as GlMatrix from "gl-matrix";
import type { API, RecursivePartial, RenderSettings, RenderOutput, View, OrthoControllerParams, Scene, SearchPattern, HierarcicalObjectReference } from "@novorender/webgl-api";
import type { SceneData } from "@novorender/data-js-api";
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

  // load a public scene
  const sceneData = (await dataApi.loadScene("fa20cb75e20e42b789c8e0f18ef5cc6f")) as SceneData;

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
  const view = await initView(webglApi, canvas, sceneData, renderSettings);

  const previewCanvasContext2D = previewCanvas.getContext("2d");
  let preview: string | undefined;
  let minimap: MinimapHelper;
  if (sceneData && !(sceneData as any).error) {
    minimap = await downloadMinimap(sceneData, glMatrix);
    preview = minimap.getMinimapImage();
    try {
      const img = await loadImage(preview);
      minimap.pixelWidth = previewCanvas.width; // Set canvas width
      minimap.pixelHeight = previewCanvas.height; // Set canvas height in minimap helper
      if (previewCanvasContext2D) {
        previewCanvasContext2D.drawImage(img, 0, 0, previewCanvas.width, previewCanvas.height);
      }
    } catch (error) {
      console.error("Failed to load the preview image ", error);
    }
  }

  let currentOutput: RenderOutput;

  let previousAreaMinX: number;
  let previousAreaMinY: number;

  // PDF view click listener
  previewCanvas.onclick = async (e: MouseEvent) => {
    // Get the position of the click relative to the canvas
    const rect = previewCanvas.getBoundingClientRect();
    let centerX = e.clientX - rect.left;
    let centerY = e.clientY - rect.top;
    if (previousArea) {
      previousAreaMinX = previousArea.x;
      previousAreaMinY = previousArea.y;
      centerX = previousAreaMinX + centerX / currentLevel;
      centerY = previousAreaMinY + centerY / currentLevel;
    }
    view.camera.controller.moveTo(minimap.toWorld(glMatrix.vec2.fromValues(centerX, centerY)), view.camera.rotation);
  };

  // create tree
  const quadTree = new Quadtree({
    // tree's width/height will be 50% bigger than the actual canvas size because we need to exclude some quads that are out of bounds (11, 13, 22, 23, 31, 32, 33)
    width: previewCanvas.width + previewCanvas.width / 2,
    height: previewCanvas.height + previewCanvas.height / 2,
    x: 0,
    y: 0,
    Id: "root",
  });

  // split tree
  quadTree.split();

  let wheelDelta = 1,
    level: number,
    currentLevel = 1,
    previousArea: Rectangle | undefined,
    elements: Quadtree[] | undefined,
    zoomedImage: string | undefined;

  // PDF view wheel event
  previewCanvas.onwheel = async (e) => {
    e.preventDefault();

    wheelDelta += e.deltaY * -0.01;
    wheelDelta = Math.min(Math.max(1, wheelDelta), 5);
    currentLevel = Math.ceil(wheelDelta);

    if (currentLevel === 1) {
      // reset the zoom
      level = 1;
      try {
        const initialImage = await loadImage(preview as string);
        if (previewCanvasContext2D) {
          previewCanvasContext2D.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
          previewCanvasContext2D.drawImage(initialImage, 0, 0, previewCanvas.width, previewCanvas.height);
        }
      } catch (error) {
        console.error("Failed to load the preview image ", error);
      }
      previousArea = undefined;
      elements = undefined;
      zoomedImage = undefined;
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
    elements = quadTree.retrieve(previousArea, currentLevel);
    await drawAndStitchOnCanvas(elements, previousArea);
  };

  // draws one or more image tiles on canvas
  const drawAndStitchOnCanvas = async (elements: Quadtree[], area: Rectangle) => {
    // filter-out unnecessary quads that are out of bounds of canvas
    const outOfBoundsQuads = ["11", "13", "22", "23", "31", "32", "33"];
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

    previewCanvasContext2D?.clearRect(0, 0, previewCanvas.width, previewCanvas.height);

    // Loop through the found nodes and draw images based on node on the canvas
    for (let i = 0; i < elements.length; i++) {
      const node = elements[i];

      const nodeBoundsWidth = node.bounds.width;
      const nodeBoundsHeight = node.bounds.height;

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
        const sx = cutLeft * boundsWRatio;
        const sy = cutTop * boundsHRatio;

        const sWidth = loadedImage.naturalWidth - sx - cutRight * boundsWRatio;
        const sHeight = loadedImage.naturalHeight - sy - cutBot * boundsHRatio;
        const dWidth = (node.bounds.width - cutX) * zoom;
        const dHeight = (node.bounds.height - cutY) * zoom;

        previewCanvasContext2D?.drawImage(loadedImage, sx, sy, sWidth, sHeight, x, y, dWidth, dHeight);
      } catch (err) {
        console.error("Something went wrong", err);
      }
    }

    zoomedImage = previewCanvas.toDataURL();
  };

  let prevCamPos: vec3;
  let prevCamRot: quat;

  function animate() {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const ctx = previewCanvas.getContext("2d")!;

    // Run every frame to check if the camera has changed
    if (!prevCamRot || !glMatrix.quat.equals(prevCamRot, view.camera.rotation) || !prevCamPos || !glMatrix.vec3.equals(prevCamPos, view.camera.position)) {
      console.log("CAMERA HAS CHANGED!!!");

      prevCamRot = glMatrix.quat.clone(view.camera.rotation);
      prevCamPos = glMatrix.vec3.clone(view.camera.position);
      if (minimap) {
        // Update minimap info based on camera position. Returns true if it changed the pdf to another floor
        minimap.update(view.camera.position as vec3);

        let imgUrl: string;

        if (elements?.length && currentLevel !== 1 && zoomedImage) {
          imgUrl = zoomedImage;
        } else {
          imgUrl = minimap.getMinimapImage();
        }

        loadImage(imgUrl).then((img) => {
          // Redraw the image for te minimap
          ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
          // ctx.drawImage(img, 300, 0, img.width, img.height, 0, 0, img.width * 1.5, img.height * 1.5);
          ctx.drawImage(img, 0, 0, previewCanvas.width, previewCanvas.height);
          drawLine(ctx);
        });
      }
    }

    // animationFrameId = requestAnimationFrame(() => animate());
  }

  const drawLine = (ctx: CanvasRenderingContext2D) => {
    //Gets the camera position in minimap space
    const minimapPos = minimap.toMinimap(view.camera.position as vec3);

    //Gets a cone of the camera direction in minimap space, point[0] is the camera position
    const dirPath = minimap.directionPoints(view.camera.position as vec3, view.camera.rotation as quat);

    if (previousArea) {
      const newX = previousArea.x * currentLevel;
      const newY = previousArea.y * currentLevel;

      minimapPos[0] = minimapPos[0] * currentLevel - newX;
      minimapPos[1] = minimapPos[1] * currentLevel - newY;
      dirPath[0][0] = dirPath[0][0] * currentLevel - newX;
      dirPath[0][1] = dirPath[0][1] * currentLevel - newY;
    }

    ctx.strokeStyle = "green";
    for (let i = 1; i < dirPath.length; ++i) {
      ctx.beginPath();
      ctx.lineWidth = 3;
      ctx.moveTo(dirPath[0][0], dirPath[0][1]);
      ctx.lineTo(dirPath[i][0], dirPath[i][1]);
      ctx.stroke();
    }
    ctx.fillStyle = "green";
    ctx.beginPath();
    ctx.ellipse(minimapPos[0], minimapPos[1], 5, 5, 0, 0, Math.PI * 2);
    ctx.fill();
  };

  // Create a bitmap context to display render output
  const ctx = canvas.getContext("bitmaprenderer");

  // runs resizeObserver for main canvas (3D view), just to update width/height.
  runResizeObserver(view, canvas);

  // resizeObserver for preview canvas (right-side) to re-draw images/arc or update size on pane resizes.
  // new ResizeObserver((entries) => {
  //   for (const { contentRect } of entries) {
  //     const scaledWidth = contentRect.width / previewCanvasWidth;
  //     const scaledHeight = contentRect.height / previewCanvasHeight;
  //     if (pdfPosA) {
  //       updatedPdfPosA = glMatrix.vec2.fromValues(scaledWidth * pdfPosA[0], scaledHeight * pdfPosA[1]);
  //     }
  //     if (pdfPosB) {
  //       updatedPdfPosB = glMatrix.vec2.fromValues(scaledWidth * pdfPosB[0], scaledHeight * pdfPosB[1]);
  //     }
  //     if (preview && previewCanvasContext2D) {
  //       loadImage(preview)
  //         .then((img) => {
  //           if (previewCanvasContext2D && preview) {
  //             previewCanvasContext2D.clearRect(0, 0, contentRect.width, contentRect.height);
  //             // Redraw the image to the preview canvas
  //             previewCanvasContext2D.drawImage(img, 0, 0, contentRect.width, contentRect.height);
  //           }
  //         })
  //         .catch((err) => console.log("Failed to load the preview image ", err));
  //     }
  //   }
  // }).observe(previewCanvas);

  // render loop
  // eslint-disable-next-line no-constant-condition
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

    animate();

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

async function initView(webglApi: typeof WebglApi, canvas: HTMLCanvasElement, sceneData: SceneData, renderSettings: RecursivePartial<RenderSettings>): Promise<View> {
  // Destructure relevant properties into variables
  const { url, db, settings, camera: cameraParams } = sceneData;

  // initialize the webgl api
  const api = webglApi.createAPI();

  // Load scene
  const scene = await api.loadScene(url, db);

  // Create a view with the scene's saved settings
  const view = await api.createView(settings, canvas);

  view.applySettings(renderSettings);

  // Create a camera controller with the saved parameters with ortho as fallback
  const camera = cameraParams ?? ({ kind: "flight" } as any);
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

// Function to load an image
function loadImage(url: string, id?: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
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
      if (this.Id === "root" && level === 0) {
        _id = "root";
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
        returnObjects = returnObjects.concat(this.nodes[indexes[i]].retrieve(obj, testLevel));
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
export class Rectangle implements NodeGeometry, Indexable {
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
    const boundsCenterX = node.x + node.width / 2;
    const boundsCenterY = node.y + node.height / 2;

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

    // console.log("diffY ", diffY);

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
