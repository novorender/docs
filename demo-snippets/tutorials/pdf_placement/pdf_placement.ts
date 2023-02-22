// HiddenRangeStarted
import * as NovoRender from "@novorender/webgl-api";
import * as MeasureAPI from "@novorender/measure-api";
import * as DataJsAPI from "@novorender/data-js-api";
import * as GlMatrix from "gl-matrix";
import type { API, RecursivePartial, RenderSettings, RenderOutput, View, OrthoControllerParams, Scene } from '@novorender/webgl-api';
import type { SceneData } from '@novorender/data-js-api';
import type { DrawPart, DrawProduct } from "@novorender/measure-api";
import type { vec2, ReadonlyVec3 } from 'gl-matrix';
export interface IParams {
    webglAPI: API;
    canvas: HTMLCanvasElement;
    measureAPI: typeof MeasureAPI;
    dataJsAPI: typeof DataJsAPI;
    glMatrix: typeof GlMatrix;
    canvas2D: HTMLCanvasElement;
    previewCanvas: HTMLCanvasElement;
}

const demo_access_token = localStorage.getItem('demo_access_token');

// we export this function to our react component which will then execute it once the demo started running.
export function showTip() {
    return openAlert('Choose 2 points from the 3D view (on the left) and 2 points from the PDF view (on the right), both in the identical locations, to show the computations.');
}
const DATA_API_SERVICE_URL = "https://data.novorender.com/api";
// HiddenRangeEnded
export async function main({ webglAPI, measureAPI, dataJsAPI, glMatrix, canvas, canvas2D, previewCanvas }: IParams) {
    try {
        // Initialize the data API with the Novorender data server service
        const dataApi = dataJsAPI.createAPI({
            serviceUrl: DATA_API_SERVICE_URL,
            authHeader: async () => ({
                header: "Authorization",
                // We are using pre-generated demo token here for brevity.
                // To get your own token, look at "https://docs.novorender.com/data-rest-api/#/operations/Login".
                value: `Bearer ${demo_access_token}`,
            }),
        });

        const _measureApi = await measureAPI.createMeasureAPI();

        const pdfScene = (await dataApi.loadScene("bad260f94a5340b9b767ea2756392be4")) as SceneData;

        // adjust however you want
        const renderSettings: RecursivePartial<RenderSettings> = {
            quality: {
                resolution: { value: 1 } // Set resolution scale to 1
            },
            clippingVolume: {
                enabled: true,
                mode: "union",
                planes: [
                    [0, 1, 0, -5.5]
                ]
            }
        };

        const view = await initView(webglAPI, canvas, pdfScene, renderSettings);
        // @todo - re-enable
        // const elevation = await getElevation(view.scene as Scene);

        const preview = await downloadPdfPreview(pdfScene as SceneData);
        const previewCanvasContext2D = previewCanvas.getContext("2d");

        // image to draw on PDF view (right side).
        const img = new Image();
        img.onload = () => {
            if (previewCanvasContext2D) {
                previewCanvasContext2D.drawImage(
                    img,
                    0,
                    0,
                    previewCanvas.width,
                    previewCanvas.height,
                    // 0,
                    // 0,
                    // previewCanvas.width,
                    // previewCanvas.height
                );
            }
        };
        img.src = preview as string;

        let currentOutput: RenderOutput;

        // run the demo and the render loop
        run(view, canvas, (output) => { currentOutput = output; });

        const context2D = canvas2D.getContext("2d");

        let selectEntity: 1 | 2 = 1;
        let posA: ReadonlyVec3;
        let posB: ReadonlyVec3;
        let draw: MeasureAPI.DrawProduct | undefined;
        let selectingA = true;
        let pdfPosA: vec2 | undefined = undefined;
        let pdfPosB: vec2 | undefined = undefined;
        let imgHeight: number;
        let imgWidth: number;

        // World view click listener
        canvas.onclick = async (e: MouseEvent) => {
            if (currentOutput) {
                const result1 = await currentOutput.pick(e.offsetX, e.offsetY);
                if (result1) {
                    if (selectEntity === 1) {
                        posA = result1.position;
                        selectEntity = 2;
                    }
                    else {
                        posB = result1.position;
                        selectEntity = 1;
                    }
                    if (posA && posB) {
                        draw = _measureApi.getDrawObjectFromPoints(view, [posA, posB], false, false);
                    } else {
                        draw = _measureApi.getDrawObjectFromPoints(view, [posA], false, false);
                    }
                    await drawProduct(context2D, draw, 3, canvas2D);
                }
            }
        };

        // Preview Canvas (right-side) click listener
        previewCanvas.onclick = (e: MouseEvent) => {

            // destructure necessary glMatrix functions
            const { vec2: { fromValues, dist, sub, create, normalize, dot } } = glMatrix;

            if (previewCanvas && preview && previewCanvasContext2D) {
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
                    img.onload = function () {
                        if (previewCanvasContext2D && preview) {
                            // Redraw the image to the preview canvas
                            previewCanvasContext2D.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
                            previewCanvasContext2D.drawImage(img, 0, 0, previewCanvas.width, previewCanvas.height);
                            imgHeight = img.height;
                            imgWidth = img.width;
                            if (pdfPosA) {
                                previewCanvasContext2D.fillStyle = "green";
                                previewCanvasContext2D.beginPath();
                                previewCanvasContext2D.ellipse(pdfPosA[0], pdfPosA[1], 5, 5, 0, 0, Math.PI * 2);
                                previewCanvasContext2D.fill();
                            }
                            if (pdfPosB) {
                                previewCanvasContext2D.fillStyle = "blue";
                                previewCanvasContext2D.beginPath();
                                previewCanvasContext2D.ellipse(pdfPosB[0], pdfPosB[1], 5, 5, 0, 0, Math.PI * 2);
                                previewCanvasContext2D.fill();
                            }
                        }
                    };
                    img.src = preview;
                }

                if (pdfPosA && pdfPosB && draw) {
                    const modelPosA = fromValues(posA[0], posA[2] * -1);
                    const modelPosB = fromValues(posB[0], posB[2] * -1);
                    const canvasToImageScaleX = imgWidth / previewCanvas.width;
                    const canvasToImageScaleY = imgHeight / previewCanvas.height;
                    //Invert Y axis on the pixel positions on the pdf image
                    const pixelPosA = fromValues(pdfPosA[0] * canvasToImageScaleX, imgHeight - (pdfPosA[1] * canvasToImageScaleY));
                    const pixelPosB = fromValues(pdfPosB[0] * canvasToImageScaleX, imgHeight - (pdfPosB[1] * canvasToImageScaleY));
                    const pixelLength = dist(pixelPosA, pixelPosB);
                    const modelLength = dist(modelPosA, modelPosB);
                    const modelDir = sub(create(), modelPosB, modelPosA);
                    normalize(modelDir, modelDir);
                    const pixDir = sub(create(), pixelPosA, pixelPosB);
                    normalize(pixDir, pixDir);
                    const scale = modelLength / pixelLength;
                    const angleAroundZ = 1 + dot(modelDir, pixDir);
                    const pdfToWorldScale = imgHeight * scale;
                    const translation = sub(
                        create(),
                        modelPosA,
                        fromValues(pixelPosA[0] * scale, pixelPosA[1] * scale)
                    );

                    // logs
                    console.log("angleAroundZ", angleAroundZ);
                    console.log("pdfToWorldScale ", pdfToWorldScale);
                    console.log("translation ", translation);

                    // calculations to show in info pane
                    const calculations = { angleAroundZ, pdfToWorldScale, translation };
                    openInfoPane(calculations);
                }
            }
        };

    } catch (e) {
        console.warn("An error occurred ", e);
    }
}

async function getElevation(scene: Scene): Promise<number | undefined> {
    try {
        const iterator = scene.search({ searchPattern: [{ property: "IfcClass", value: "IfcBuildingStorey", exact: true },], }, undefined);
        const iteratorResult = await iterator.next();
        const data = await iteratorResult.value.loadMetaData();
        for (const prop of data.properties) {
            if (prop[0] === "Novorender/Elevation") {
                return Number(prop[1]);
            }
        }
        return undefined;

    } catch (error) { console.log(error); }
}

async function downloadPdfPreview(scene: SceneData): Promise<string | undefined> {
    if (scene.db) {
        // perform a db search to get the metadata
        const iterator = scene.db.search({ searchPattern: [{ property: "Novorender/Document/Preview", exact: true }] }, undefined);
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
async function initView(
    api: API,
    canvas: HTMLCanvasElement,
    pdfScene: SceneData,
    renderSettings: RecursivePartial<RenderSettings>
): Promise<View> {

    // Destructure relevant properties into variables
    const { url, db, settings, camera: cameraParams } = pdfScene;

    // Load scene
    const scene = await api.loadScene(NovoRender.WellKnownSceneUrls.condos);

    // Create a view with the scene's saved settings
    const view = await api.createView(settings, canvas);

    view.applySettings(renderSettings);

    const orthoController = api.createCameraController({ kind: "ortho" }, canvas);
    (orthoController as any).init([750, 18, -180], [0, 0, 0], view.camera);
    (orthoController.params as OrthoControllerParams).referenceCoordSys =
        [
            1, 0, 0, 0,
            0, 0, -1, 0,
            0, 1, 0, 0,
            728, 7, -230, 1
        ];
    (orthoController.params as OrthoControllerParams).fieldOfView = 35;
    view.camera.controller = orthoController;

    // Assign the scene to the view
    view.scene = scene;

    return view;
}

async function run(
    view: View,
    canvas: HTMLCanvasElement,
    cb: (output: RenderOutput) => void
): Promise<void> {

    let currentOutput: RenderOutput;

    // Handle canvas resizes
    const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
            canvas.width = entry.contentRect.width;
            canvas.height = entry.contentRect.height;
            view.applySettings({
                display: { width: canvas.width, height: canvas.height }
            });
        }
    });

    resizeObserver.observe(canvas);

    // Create a bitmap context to display render output
    const ctx = canvas.getContext("bitmaprenderer");

    // Main render loop
    while (true) {
        // Render frame
        currentOutput = await view.render();
        cb(currentOutput);
        {
            // Finalize output image
            const image = await currentOutput.getImage();
            if (image) {
                // Display in canvas
                ctx?.transferFromImageBitmap(image);
                image.close();
            }
        }
    }
}

// Below are utility functions copied from our frontend (https://github.com/novorender/novoweb/blob/develop/src/features/engine2D/utils.ts)
interface ColorSettings {
    lineColor?: string | CanvasGradient;
    fillColor?: string;
    pointColor?: string | { start: string; middle: string; end: string; };
    outlineColor?: string;
    complexCylinder?: boolean;
}

function drawProduct(
    context2D: CanvasRenderingContext2D | null,
    product: DrawProduct | undefined,
    pixelWidth: number,
    canvas2D: HTMLCanvasElement
): void {
    if (context2D) {
        context2D.clearRect(0, 0, canvas2D.width, canvas2D.height);
        for (const obj of (product as DrawProduct).objects) {
            obj.parts.forEach(part => {
                drawPart(context2D, part, pixelWidth);
            });
        }
    }
}

function drawPart(
    ctx: CanvasRenderingContext2D,
    part: DrawPart,
    pixelWidth: number,
): boolean {
    if (part.vertices2D) {
        ctx.lineWidth = pixelWidth;
        return drawPoints(ctx, part);
    }
    return false;
}

function drawPoints(ctx: CanvasRenderingContext2D, part: DrawPart) {

    const colorSettings: Array<ColorSettings> = [
        { fillColor: 'green', outlineColor: 'green', lineColor: 'green' },
        { fillColor: 'blue', outlineColor: 'blue', lineColor: 'blue' }
    ];

    if (part.vertices2D) {
        for (let i = 0; i < part.vertices2D.length; ++i) {
            ctx.fillStyle = colorSettings[i].fillColor as string;
            ctx.lineWidth = 2;
            ctx.strokeStyle = "black";
            ctx.beginPath();
            ctx.arc(part.vertices2D[i][0], part.vertices2D[i][1], 5, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
        }
        return true;
    }
    return false;
}

// HiddenRangeEnded