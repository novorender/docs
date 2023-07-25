// HiddenRangeStarted
import * as WebglApi from "@novorender/webgl-api";
import * as MeasureApi from "@novorender/measure-api";
import * as DataJsApi from "@novorender/data-js-api";
import * as GlMatrix from "gl-matrix";
import type { RecursivePartial, RenderSettings, RenderOutput, View } from "@novorender/webgl-api";
import type { SceneData } from "@novorender/data-js-api";
import type { vec2, vec3, quat } from "gl-matrix";

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
  return openAlert("Clicking any position on the minimap (right-side) will navigate the camera to the same position on the 3D view (left-side), you can also zoom in/out on the minimap using mouse wheel or touchpad.");
}
const DATA_API_SERVICE_URL = "https://data.novorender.com/api";

// HiddenRangeEnded
export async function main({ webglApi, dataJsApi, glMatrix, canvas, previewCanvas }: IParams) {
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
    minimap = await downloadMinimap(previewCanvas.width, previewCanvas.height, sceneData, glMatrix);

    preview = minimap.getMinimapImage();
    minimap.pixelWidth = previewCanvas.width; // Set canvas width
    minimap.pixelHeight = previewCanvas.height; // Set canvas height in minimap helper
  }

  let currentOutput: RenderOutput;

  // PDF view click listener
  previewCanvas.onclick = (e: MouseEvent) => {
    // Get the position of the click relative to the canvas
    const rect = previewCanvas.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;

    if (currentArea) {
      x = currentArea.x + x / currentLevel;
      y = currentArea.y + y / currentLevel;
    }

    view.camera.controller.moveTo(minimap.toWorld(glMatrix.vec2.fromValues(x, y)), view.camera.rotation);
  };

  let wheelDelta = 1,
    level: number,
    currentLevel = 1,
    currentArea: NodeGeometry | undefined,
    elements: QuadNode[] | undefined,
    zoomedImage: string | undefined;

  // PDF view wheel event
  previewCanvas.onwheel = async (e) => {
    e.preventDefault();

    wheelDelta += e.deltaY * -0.01;
    wheelDelta = Math.min(Math.max(1, wheelDelta), 5);
    currentLevel = Math.ceil(wheelDelta);

    if (currentLevel === 1) {
      // reset the zoom
      level = currentLevel;
      try {
        const initialImage = await loadImage(preview as string);
        if (previewCanvasContext2D) {
          previewCanvasContext2D.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
          previewCanvasContext2D.drawImage(initialImage, 0, 0, previewCanvas.width, previewCanvas.height);
        }
      } catch (error) {
        console.error("Failed to load the preview image ", error);
      }
      currentArea = undefined;
      elements = undefined;
      zoomedImage = undefined;
      return;
    }
    if (level === currentLevel) {
      return;
    }
    if (level === 2) {
      level++;
    }
    level = currentLevel;

    // Get the position of the click relative to the canvas
    const rect = previewCanvas.getBoundingClientRect();
    let centerX = e.clientX - rect.left;
    let centerY = e.clientY - rect.top;

    const width = previewCanvas.width / currentLevel;
    const height = previewCanvas.height / currentLevel;
    if (currentArea) {
      const previousAreaMinX = currentArea.x;
      const previousAreaMinY = currentArea.y;
      centerX = previousAreaMinX + centerX / currentLevel;
      centerY = previousAreaMinY + centerY / currentLevel;
    }

    const right = previewCanvas.width - (centerX + width / 2);
    const bot = previewCanvas.height - (centerY + height / 2);
    let x = centerX - width / 2;
    if (right < 0) {
      x += right;
    }
    let y = centerY - height / 2;
    if (bot < 0) {
      y += bot;
    }
    const area: NodeGeometry = {
      x: Math.max(0, x),
      y: Math.max(0, y),
      width: width,
      height: height,
    };

    currentArea = area;
    elements = minimap.retrieve(currentArea, currentLevel);
    await drawAndStitchOnCanvas(elements, currentArea);
  };

  // draws one or more image tiles on canvas
  const drawAndStitchOnCanvas = async (elements: QuadNode[], area: NodeGeometry) => {
    // clear the canvas
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

        previewCanvasContext2D?.drawImage(loadedImage, sx, sy, sWidth, sHeight, x, y, dWidth + 1, dHeight + 1); // +1 for pixel overlap to avoid grid like lines
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
  }

  const drawLine = (ctx: CanvasRenderingContext2D) => {
    // Gets the camera position in minimap space
    const minimapPos = minimap.toMinimap(view.camera.position as vec3);

    // Gets a cone of the camera direction in minimap space, point[0] is the camera position
    const dirPath = minimap.directionPoints(view.camera.position as vec3, view.camera.rotation as quat, 5 / currentLevel);
    if (currentArea) {
      minimapPos[0] = (minimapPos[0] - currentArea.x) * currentLevel;
      minimapPos[1] = (minimapPos[1] - currentArea.y) * currentLevel;
      for (let i = 0; i < 3; ++i) {
        dirPath[i][0] = (dirPath[i][0] - currentArea.x) * currentLevel;
        dirPath[i][1] = (dirPath[i][1] - currentArea.y) * currentLevel;
      }
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
  let camera: WebglApi.CameraControllerParams = cameraParams ?? {
    kind: "flight",
  };
  camera = { ...camera, ...{ yaw: 0, pitch: -90 } };
  view.camera.controller = api.createCameraController(camera as WebglApi.FlightControllerParams, canvas);

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
 * MINIMAP CLASS & HELPERS
 * *****************************************************************************************************
 * *****************************************************************************************************
 */

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

class QuadNode {
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

  Id: string;

  empty = false;

  nodes: QuadNode[];

  constructor(bounds: { x: number; y: number; width: number; height: number; Id: string }, level: number) {
    this.bounds = {
      x: bounds.x || 0,
      y: bounds.y || 0,
      width: bounds.width,
      height: bounds.height,
    };
    this.level = level || 0;
    this.nodes = [];
    this.Id = bounds.Id;
  }

  /**
   * Split the node into 4 subnodes.
   */
  split(splitWidth: number, splitHeight: number): void {
    const level = this.level + 1;
    const { bounds } = this;

    const width = splitWidth / 2,
      height = splitHeight / 2,
      x = bounds.x,
      y = bounds.y;

    // max 5 levels
    if (level > 6) {
      return;
    }

    const coords = [
      { x: x, y: y },
      { x: x + width, y: y },
      { x: x, y: y + height },
      { x: x + width, y: y + height },
    ];
    let _id;
    {
      for (let i = 0; i < coords.length; i++) {
        if (level === 0) {
          _id = "root";
        }
        if (level === 1) {
          _id = i.toString();
        } else {
          _id = this.Id + i.toString();
        }
        const childWidth = Math.min(width, bounds.width - (coords[i].x - bounds.x));
        const childHeight = Math.min(height, bounds.height - (coords[i].y - bounds.y));
        this.nodes[i] = new QuadNode(
          {
            x: coords[i].x,
            y: coords[i].y,
            height: childHeight,
            width: childWidth,
            Id: _id,
          },
          level
        );

        if (childWidth <= 0 || childHeight <= 0) {
          this.nodes[i].empty = true;
        } else {
          this.nodes[i].split(width, height);
        }
      }
    }
  }

  overlaps(obj: NodeGeometry): boolean {
    const { bounds } = this;
    const maxBoundX = bounds.x + bounds.width;
    const maxBoundY = bounds.y + bounds.height;
    const maxObjX = obj.x + obj.width;
    const maxObjY = obj.y + obj.height;
    const insideX = (obj.x >= bounds.x && obj.x <= maxBoundX) || (maxObjX >= maxBoundX && obj.x <= maxBoundX) || (maxObjX >= bounds.x && maxObjX < maxBoundX);
    const insideY = (obj.y >= bounds.y && obj.y <= maxBoundY) || (maxObjY >= maxBoundY && obj.y <= maxBoundY) || (maxObjY >= bounds.y && maxObjY < maxBoundY);
    if (insideX && insideY) {
      return true;
    }
    return false;
  }

  /**
   * Return all objects that could collide with the given geometry.
   * @param obj - geometry to be checked
   * @param testLevel - level to be checked
   * @returns Array containing all detected objects.
   */
  retrieve(obj: NodeGeometry, testLevel: number): QuadNode[] {
    let returnObjects: QuadNode[] = [];
    //if we have subnodes, retrieve their objects
    if (this.nodes.length && this.level < testLevel) {
      for (let i = 0; i < this.nodes.length; i++) {
        const node = this.nodes[i];
        if (!node.empty && node.overlaps(obj)) {
          returnObjects = returnObjects.concat(node.retrieve(obj, testLevel));
        }
      }
    } else {
      returnObjects.push(this);
    }
    return returnObjects;
  }
}

/**
 * Class representing a MinimapHelper that also contains an instance of `QuadNode` class.
 */
export class MinimapHelper {
  /**
   * Subnodes of this node
   * @defaultValue `[]`
   * @readonly
   */
  quadTree: QuadNode;

  pixelWidth = 0;
  pixelHeight = 0;
  currentIndex = 0;

  glMatrix!: typeof GlMatrix;

  /**
   * Minimap Constructor
   * @param minimaps - minimap info
   * @param glMatrix - glMatrix dependency
   * @param quadTreeProps - bounds and properties of the node
   * @param level - depth level (internal use only, required for subnodes)
   */
  constructor(width: number, height: number, readonly minimaps: MinimapInfo[], glMatrix: typeof GlMatrix) {
    this.pixelWidth = width;
    this.pixelHeight = height;
    this.glMatrix = glMatrix;
    this.quadTree = new QuadNode({ x: 0, y: 0, width, height, Id: "" }, 1);
  }

  async split(topLevelWidth: number, topLevelHeight: number) {
    const numImagesWidth = topLevelWidth / 256;
    const cw = Math.ceil(Math.log(numImagesWidth) / Math.log(2));
    const widthSplitBy = Math.pow(2, cw) / 2;
    const widthSplit = widthSplitBy / numImagesWidth;

    const numImagesHeight = topLevelHeight / 256;
    const ch = Math.ceil(Math.log(numImagesHeight) / Math.log(2));
    const heightSplitBy = Math.pow(2, ch) / 2;
    const heightSplit = heightSplitBy / numImagesHeight;
    this.quadTree.split(this.pixelWidth * widthSplit * 2, this.pixelHeight * heightSplit * 2);
  }

  retrieve(obj: NodeGeometry, testLevel: number): QuadNode[] {
    return this.quadTree.retrieve(obj, testLevel);
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
    pos[1] += 10;
    this.glMatrix.vec3.scaleAndAdd(pos, pos, curInfo.dirX, curInfo.dx * diffX);
    this.glMatrix.vec3.scaleAndAdd(pos, pos, curInfo.dirY, curInfo.dy * diffY);
    return pos;
  }

  directionPoints(worldPos: vec3, rot: quat, length: number): vec2[] {
    const path: vec2[] = [];
    path.push(this.toMinimap(worldPos));
    const rotA = this.glMatrix.quat.rotateY(this.glMatrix.quat.create(), rot, Math.PI / 8);
    const dirZ = this.glMatrix.vec3.fromValues(0, 0, -1);
    const dirA = this.glMatrix.vec3.transformQuat(this.glMatrix.vec3.create(), dirZ, rotA);
    const posA = this.glMatrix.vec3.scaleAndAdd(this.glMatrix.vec3.create(), worldPos, dirA, length);
    path.push(this.toMinimap(posA));

    const rotB = this.glMatrix.quat.rotateY(this.glMatrix.quat.create(), rot, -Math.PI / 8);
    const dirB = this.glMatrix.vec3.transformQuat(this.glMatrix.vec3.create(), dirZ, rotB);
    const posB = this.glMatrix.vec3.scaleAndAdd(this.glMatrix.vec3.create(), worldPos, dirB, length);
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

async function downloadMinimap(width: number, height: number, scene: SceneData, glMatrix: typeof GlMatrix): Promise<MinimapHelper> {
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
  let topLevelWidth = 0;
  let topLevelHeight = 0;
  for (const prop of data.properties) {
    switch (prop[0]) {
      // get the corners
      case "Novorender/Document/Corners": {
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
        break;
      }

      // get the image preview
      case "Novorender/Document/Preview": {
        const url = new URL((scene as SceneData).url);
        url.pathname += prop[1];
        // This is the PDF image URL
        image = url.toString();
        break;
      }

      // get the top-level dimensions of quadtree
      case "Novorender/Document/Size": {
        const sizes = prop[1].split(",");
        topLevelWidth = Number(sizes[0]);
        topLevelHeight = Number(sizes[1]);
        break;
      }
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

  const minimap = new MinimapHelper(width, height, minimaps, glMatrix);

  // split the quadtree
  await minimap.split(topLevelWidth, topLevelHeight);

  return minimap;
}

/**
 * *****************************************************************************************************
 * *****************************************************************************************************
 * END OF MINIMAP CLASS & HELPERS
 * *****************************************************************************************************
 * *****************************************************************************************************
 */
