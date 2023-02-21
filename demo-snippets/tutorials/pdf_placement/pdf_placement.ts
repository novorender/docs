// HiddenRangeStarted
import * as NovoRender from "@novorender/webgl-api";
import * as MeasureAPI from "@novorender/measure-api";
import * as DataJsAPI from "@novorender/data-js-api";
import * as GlMatrix from "gl-matrix";
import type { DrawPart, DrawProduct } from "@novorender/measure-api";
import type { vec2, ReadonlyVec3 } from 'gl-matrix';
export interface IParams {
    webglAPI: NovoRender.API;
    canvas: HTMLCanvasElement;
    measureAPI: typeof MeasureAPI;
    dataJsAPI: typeof DataJsAPI;
    glMatrix: typeof GlMatrix;
    canvas2D: HTMLCanvasElement;
    previewCanvas: HTMLCanvasElement;
}

// we export this function to our react component which will then execute it once the demo started running.
export function showTip() {
    return openAlert('Choose 2 points from the 3D view (on the left) and 2 points from the PDF view (on the right), both in the identical locations, to show the computations.');
}

// HiddenRangeEnded
const DATA_API_SERVICE_URL = "https://data.novorender.com/api";
export async function main({ webglAPI, measureAPI, dataJsAPI, glMatrix, canvas, canvas2D, previewCanvas }: IParams) {
    try {
        // Init
        // Initialize the data API with the Novorender data server service
        const accessToken = await login();
        const dataApi = dataJsAPI.createAPI({
            serviceUrl: DATA_API_SERVICE_URL,
            authHeader: async () => ({
                header: "Authorization",
                value: `Bearer ${accessToken}`,
            }),
        });
        const _measureApi = await measureAPI.createMeasureAPI();

        const pdfScene = (await dataApi.loadScene("bad260f94a5340b9b767ea2756392be4")) as DataJsAPI.SceneData;
        const view = await initView(webglAPI, canvas, pdfScene);
        // @todo - reenable
        // const elevation = await getElevation(view.scene as NovoRender.Scene);

        const preview = await downloadPdfPreview(pdfScene as DataJsAPI.SceneData);
        const previewCanvasContext2D = previewCanvas.getContext("2d");
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

        let currentOutput: NovoRender.RenderOutput;

        // run the demo and render loop
        run(view, canvas, (output) => { currentOutput = output; });

        let selectEntity: 1 | 2 = 1;

        const context2D = canvas2D.getContext("2d");

        let posA: ReadonlyVec3;
        let posB: ReadonlyVec3;
        let draw: MeasureAPI.DrawProduct | undefined;

        // World view click listener
        canvas.onclick = async (e) => {
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

        let selectingA = true;
        let pdfPosA: vec2 | undefined = undefined;
        let pdfPosB: vec2 | undefined = undefined;

        let imgHeight: number;
        let imgWidth: number;

        // Preview Canvas (left-side) click listener
        previewCanvas.onclick = (e: MouseEvent) => {
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

async function login(): Promise<string> {
    // Hardcoded values for demo purposes
    const username = "";
    const password = "";

    // POST to the dataserver service's /user/login endpoint
    const res: { token: string; } = await fetch(
        "https://data.novorender.com/api/user/login",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: `username=${username}&password=${password}`,
        }
    )
        .then((res) => res.json())
        .catch(() => {
            // Handle however you like
            return { token: "" };
        });
    return res.token;
}

// HiddenRangeStarted
async function initView(
    api: NovoRender.API,
    canvas: HTMLCanvasElement,
    pdfScene: DataJsAPI.SceneData
): Promise<NovoRender.View> {

    // Destructure relevant properties into variables
    const { url, db, settings, camera: cameraParams } = pdfScene;

    // Load scene
    const scene = await api.loadScene(NovoRender.WellKnownSceneUrls.condos);

    // Create a view with the scene's saved settings
    const view = await api.createView(settings, canvas);

    // Set resolution scale to 1
    view.applySettings({ quality: { resolution: { value: 1 } } });

    const orthoController = api.createCameraController({ kind: "ortho" }, canvas);
    (orthoController as any).init([750, 18, -180], [0, 0, 0], view.camera);
    (orthoController.params as NovoRender.OrthoControllerParams).referenceCoordSys =
        [
            1, 0, 0, 0,
            0, 0, -1, 0,
            0, 1, 0, 0,
            728, 7, -230, 1
        ];
    (orthoController.params as NovoRender.OrthoControllerParams).fieldOfView = 35;
    view.camera.controller = orthoController;

    // Assign the scene to the view
    view.scene = scene;

    return view;
}

async function run(
    view: NovoRender.View,
    canvas: HTMLCanvasElement,
    cb: (output: NovoRender.RenderOutput) => void
): Promise<void> {

    let currentOutput: NovoRender.RenderOutput;

    // Handle canvas resizes
    const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
            canvas.width = entry.contentRect.width;
            canvas.height = entry.contentRect.height;
            view.applySettings({
                display: { width: canvas.width, height: canvas.height },
                clippingVolume: {
                    enabled: true,
                    mode: "union",
                    planes: [
                        [0, 1, 0, -5.5]
                    ]
                }
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

export async function getElevation(scene: NovoRender.Scene): Promise<number | undefined> {
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

export async function downloadPdfPreview(scene: DataJsAPI.SceneData): Promise<string | undefined> {

    if (scene.db) {
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

// Below are utility functions copied from our frontend (https://github.com/novorender/novoweb/blob/develop/src/features/engine2D/utils.ts)
export interface ColorSettings {
    lineColor?: string | CanvasGradient;
    fillColor?: string;
    pointColor?: string | { start: string; middle: string; end: string; };
    outlineColor?: string;
    complexCylinder?: boolean;
}

export function drawProduct(
    context2D: CanvasRenderingContext2D | null,
    product: DrawProduct | undefined,
    pixelWidth: number,
    canvas2D: HTMLCanvasElement
) {
    if (context2D) {
        context2D.clearRect(0, 0, canvas2D.width, canvas2D.height);
        for (const obj of (product as DrawProduct).objects) {
            obj.parts.forEach(part => {
                drawPart(context2D, part, pixelWidth);
            });
        }
    }
}

export function drawPart(
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