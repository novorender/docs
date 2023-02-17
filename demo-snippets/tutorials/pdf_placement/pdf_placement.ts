// HiddenRangeStarted
import * as NovoRender from "@novorender/webgl-api";
import * as MeasureAPI from "@novorender/measure-api";
import * as DataJsAPI from "@novorender/data-js-api";
import * as GlMatrix from "gl-matrix";
import type { DrawPart, DrawProduct } from "@novorender/measure-api";
import type { vec2 } from 'gl-matrix';
export interface IParams {
    webglAPI: NovoRender.API;
    canvas: HTMLCanvasElement;
    measureAPI: typeof MeasureAPI;
    dataJsAPI: typeof DataJsAPI;
    glMatrix: typeof GlMatrix;
    canvas2D: HTMLCanvasElement;
    previewCanvas: HTMLCanvasElement;
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
        const elevation = await getElevation(view.scene as NovoRender.Scene);

        const preview = await downloadPdfPreview(pdfScene as DataJsAPI.SceneData);
        const previewCanvasContext2D = previewCanvas.getContext("2d");
        const img = new Image();
        img.onload = function () {
            if (previewCanvasContext2D) {
                previewCanvasContext2D.drawImage(
                    img,
                    0,
                    0,
                    previewCanvas.width,
                    previewCanvas.height
                );
            }
        };
        img.src = preview as string;

        run(view, canvas, canvas2D, _measureApi, glMatrix);

        let selectingA = true;
        let pdfPosA: vec2 | undefined = undefined;
        let pdfPosB: vec2 | undefined = undefined;

        previewCanvas.onclick = (event) => {
            // if (previewCanvas && preview && previewCanvasContext2D) {

            //     console.log('clicking');

            //     const rect = canvas.getBoundingClientRect();
            //     const x = event.clientX - rect.left;
            //     const y = event.clientY - rect.top;
            //     // view.camera.controller.moveTo(
            //     //     minimap.toWorld(vec2.fromValues(x * (1 / 0.7) + 300, y * (1 / 0.7) + 200)),
            //     //     view.camera.rotation
            //     // );
            //     if (selectingA) {
            //         pdfPosA = glMatrix.vec2.fromValues(x, y);
            //     } else {
            //         pdfPosB = glMatrix.vec2.fromValues(x, y);
            //     }
            //     selectingA = !selectingA;
            //     if (preview && previewCanvasContext2D) {
            //         const img = new Image();
            //         img.onload = function () {
            //             if (previewCanvasContext2D && preview) {
            //                 //Redraw the image for te minimap
            //                 previewCanvasContext2D.clearRect(0, 0, previewCanvas.width, previewCanvas.height);

            //                 //previewCanvasContext2D.drawImage(img, 450, 200, img.width * 0.7, img.height * 0.7, 0, 0, width, height);
            //                 previewCanvasContext2D.drawImage(img, 0, 0, previewCanvas.width, previewCanvas.height);
            //                 // imgHeight.current = img.height;
            //                 // imgWidth.current = img.width;
            //                 if (pdfPosA) {
            //                     previewCanvasContext2D.fillStyle = "green";
            //                     previewCanvasContext2D.beginPath();
            //                     previewCanvasContext2D.ellipse(pdfPosA[0], pdfPosA[1], 5, 5, 0, 0, Math.PI * 2);
            //                     previewCanvasContext2D.fill();
            //                 }
            //                 if (pdfPosB) {
            //                     previewCanvasContext2D.fillStyle = "blue";
            //                     previewCanvasContext2D.beginPath();
            //                     previewCanvasContext2D.ellipse(pdfPosB[0], pdfPosB[1], 5, 5, 0, 0, Math.PI * 2);
            //                     previewCanvasContext2D.fill();
            //                 }
            //             }
            //         };
            //         img.src = preview;
            //     }
            //     if (pdfPosA && pdfPosB) {
            //         const modelPos: vec2[] = [];
            //         // _measureApi.getDrawObjectFromPoints()
            //         if (modelPos.length === 2) {
            //             const pixelPosA = glMatrix.vec2.fromValues(pdfPosA[0], previewCanvas.height - pdfPosA[1]);
            //             const picelPosB = glMatrix.vec2.fromValues(pdfPosB[0], previewCanvas.height - pdfPosB[1]);
            //             const pixelLength = glMatrix.vec2.dist(pixelPosA, picelPosB);
            //             const modelLength = glMatrix.vec2.dist(modelPos[0], modelPos[1]);
            //             const modelDir = glMatrix.vec2.sub(glMatrix.vec2.create(), modelPos[1], modelPos[0]);
            //             glMatrix.vec2.normalize(modelDir, modelDir);
            //             const pixDir = glMatrix.vec2.sub(glMatrix.vec2.create(), pixelPosA, picelPosB);
            //             glMatrix.vec2.normalize(pixDir, pixDir);
            //             const scale = modelLength / pixelLength;
            //             const angleAroundZ = glMatrix.vec2.dot(modelDir, pixDir);
            //             const pdfScale = previewCanvas.height * scale;
            //             const zeroWorld = glMatrix.vec2.sub(
            //                 glMatrix.vec2.create(),
            //                 modelPos[0],
            //                 glMatrix.vec2.fromValues(pixelPosA[0] * scale, pixelPosA[1] * scale)
            //             );

            //             console.log("angleAroundZ");
            //             console.log(angleAroundZ);
            //             console.log("pdfScale");
            //             console.log(pdfScale);
            //             console.log("zeroWorld");
            //             console.log(zeroWorld);
            //             //calulations
            //         }
            //     }
            // }
        };

    } catch (e) {
        console.warn("ee ", e);
    }
}

async function login(): Promise<string> {
    // Hardcoded values for demo purposes
    const username = "Novodev";
    const password = "Novodeverbest";

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

    // Create a camera controller with the saved parameters with turntable as fallback
    // const camera = cameraParams ?? ({ kind: "orbit" } as any);
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
    canvas2D: HTMLCanvasElement,
    measureApi: MeasureAPI.MeasureAPI,
    glMatrix: typeof GlMatrix
): Promise<void> {
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

    let currentOutput: NovoRender.RenderOutput;

    //Parametric entities used to measure between
    let measureEntity1: MeasureAPI.MeasureEntity | undefined = undefined;
    let measureEntity2: MeasureAPI.MeasureEntity | undefined = undefined;
    //number to alternate between selected entities.
    let selectEntity: 1 | 2 = 1;

    //Save the measure result so it can be drawn in the draw loop
    let result: MeasureAPI.MeasurementValues | undefined = undefined;

    const measureScene = await measureApi.loadScene(NovoRender.WellKnownSceneUrls.condos);
    const context2D = canvas2D.getContext("2d");

    canvas.onclick = async (e) => {
        if (currentOutput) {
            let result1 = await currentOutput.pick(e.offsetX, e.offsetY);
            let draw: MeasureAPI.DrawProduct | undefined;
            if (result1) {

                draw = measureApi.getDrawObjectFromPoints(view, [result1.position], false, false);

                // if (selectEntity === 1) {
                //     //Find measure entity at pick location
                //     measureEntity1 = (await measureScene.pickMeasureEntity(
                //         result1.objectId,
                //         result1.position
                //     )).entity;
                //     selectEntity = 2;
                // }
                // else {
                //     //Find measure entity at pick location
                //     measureEntity2 = (await measureScene.pickMeasureEntity(
                //         result1.objectId,
                //         result1.position
                //     )).entity;
                //     selectEntity = 1;
                // }
                // //As long as one object is selected log out the values
                // //Note that if measureEntity2 is undefined then the result will be the parametric values of measureEntity1
                // if (measureEntity1) {
                //     result = await measureScene.measure(measureEntity1, measureEntity2);
                // }

                await draw2d(measureApi, view, context2D, canvas2D, glMatrix, draw as MeasureAPI.DrawProduct);
            }
        }
    };

    // Main render loop
    while (true) {
        // Render frame
        currentOutput = await view.render();
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

export interface TextSettings {
    type: "distance" | "center";
    unit?: string;
    customText?: string[];
}

export interface CameraSettings {
    pos: GlMatrix.ReadonlyVec3;
    dir: GlMatrix.ReadonlyVec3;
}

async function draw2d(_measureApi: MeasureAPI.MeasureAPI, view: NovoRender.View, context2D: CanvasRenderingContext2D | null,
    canvas2D: HTMLCanvasElement, glMatrix: typeof GlMatrix, draw: MeasureAPI.DrawProduct) {
    //Await all draw objects first to avoid flickering
    // const [
    //     drawResult,
    //     drawProduct1,
    //     drawProduct2,
    // ] = await Promise.all([
    //     result && _measureApi.getDrawMeasureEntity(view, measureScene, result),
    //     measureEntity1 && _measureApi.getDrawMeasureEntity(view, measureScene, measureEntity1),
    //     measureEntity2 && _measureApi.getDrawMeasureEntity(view, measureScene, measureEntity2)
    // ]);

    // _measureApi.getDrawObjectFromPoints(view, measureScene, false, false);


    //Extract needed camera settings
    const { camera } = view;
    const cameraDirection = glMatrix.vec3.transformQuat(glMatrix.vec3.create(), glMatrix.vec3.fromValues(0, 0, -1), camera.rotation);
    const camSettings = { pos: camera.position, dir: cameraDirection };

    if (context2D) {
        
        context2D.clearRect(0, 0, canvas2D.width, canvas2D.height);

        drawProduct(context2D as CanvasRenderingContext2D,
            camSettings,
            draw,
            { lineColor: "green" },
            3,
            glMatrix);
    }
}


export function drawProduct(
    ctx: CanvasRenderingContext2D,
    camera: CameraSettings,
    product: DrawProduct,
    colorSettings: ColorSettings,
    pixelWidth: number,
    glMatrix: typeof GlMatrix
) {
    for (const obj of product.objects) {
        if (colorSettings.complexCylinder && obj.kind === "cylinder" && obj.parts.length === 3) {
            let startCol = "red";
            let endCol = "lime";
            const cylinderLine = obj.parts[0];
            if (cylinderLine.elevation && cylinderLine.vertices2D) {
                if (cylinderLine.elevation.from > cylinderLine.elevation.to) {
                    const tmp = startCol;
                    startCol = endCol;
                    endCol = tmp;
                }
                const gradX = glMatrix.vec2.fromValues(cylinderLine.vertices2D[0][0], cylinderLine.vertices2D[1][0]);
                const gradY = glMatrix.vec2.fromValues(cylinderLine.vertices2D[0][1], cylinderLine.vertices2D[1][1]);
                const gradient = ctx.createLinearGradient(gradX[0], gradY[0], gradX[1], gradY[1]);
                gradient.addColorStop(0, startCol);
                gradient.addColorStop(1, endCol);
                drawPart(
                    ctx,
                    camera,
                    cylinderLine,
                    { lineColor: gradient, outlineColor: "rgba(80, 80, 80, .8)" },
                    pixelWidth,
                    glMatrix
                );
            }

            for (let i = 1; i < 3; ++i) {
                const col = i === 1 ? startCol : endCol;
                drawPart(
                    ctx,
                    camera,
                    obj.parts[i],
                    { lineColor: col, outlineColor: "rgba(80, 80, 80, .8)" },
                    pixelWidth,
                    glMatrix
                );
            }
        } else {
            obj.parts.forEach((part) => {
                drawPart(ctx, camera, part, colorSettings, pixelWidth, glMatrix);
            });
        }
    }
}

export function drawPart(
    ctx: CanvasRenderingContext2D,
    camera: CameraSettings,
    part: DrawPart,
    colorSettings: ColorSettings,
    pixelWidth: number,
    glMatrix: typeof GlMatrix,
    textSettings?: TextSettings,
): boolean {
    if (part.vertices2D) {
        ctx.lineWidth = pixelWidth;
        ctx.strokeStyle = colorSettings.lineColor ?? "black";
        ctx.fillStyle = colorSettings.fillColor ?? "transparent";
        // if (part.drawType === "angle" && part.vertices2D.length === 3 && part.text) {
        //     return drawAngle(ctx, camera, part, glMatrix);
        // } else if (part.drawType === "lines" || part.drawType === "filled") {
        //     return drawLinesOrPolygon(ctx, part, colorSettings, glMatrix, textSettings);
        // } else if (part.drawType === "vertex") {
        return drawPoints(ctx, part, colorSettings);
        // }
    }
    return false;
}

function drawAngle(ctx: CanvasRenderingContext2D, camera: CameraSettings, part: DrawPart, glMatrix: typeof GlMatrix) {

    const { vec2, vec3 } = glMatrix;

    if (part.vertices2D) {
        ctx.fillStyle = "transparent";
        const anglePoint = part.vertices2D[0];
        const fromP = part.vertices2D[1];
        const toP = part.vertices2D[2];
        const d0 = vec2.sub(vec2.create(), fromP, anglePoint);
        const d1 = vec2.sub(vec2.create(), toP, anglePoint);
        const l0 = vec2.len(d0);
        const l1 = vec2.len(d1);
        const camDist = vec3.distance(camera.pos, part.vertices3D[0]);

        const dirA = vec3.sub(vec3.create(), part.vertices3D[1], part.vertices3D[0]);
        vec3.normalize(dirA, dirA);
        const dirB = vec3.sub(vec3.create(), part.vertices3D[2], part.vertices3D[0]);
        vec3.normalize(dirB, dirB);
        const dirCamA = vec3.sub(vec3.create(), part.vertices3D[1], camera.pos);
        const dirCamB = vec3.sub(vec3.create(), part.vertices3D[2], camera.pos);
        const dirCamP = vec3.sub(vec3.create(), part.vertices3D[0], camera.pos);
        const norm = vec3.cross(vec3.create(), dirA, dirB);
        vec3.normalize(dirCamA, dirCamA);
        vec3.normalize(dirCamB, dirCamB);
        vec3.normalize(dirCamP, dirCamP);

        if (Math.abs(vec3.dot(dirCamP, norm)) < 0.15) {
            return false;
        }

        if (camDist > (l0 + l1) / 10) {
            return false;
        }
        if (l0 < 40 || l1 < 40) {
            return false;
        }
        vec2.scale(d0, d0, 1 / l0);
        vec2.scale(d1, d1, 1 / l1);
        const dir = vec2.add(vec2.create(), d1, d0);
        const dirLen = vec2.len(dir);
        if (dirLen < 0.001) {
            vec2.set(dir, 0, 1);
        } else {
            vec2.scale(dir, dir, 1 / dirLen);
        }

        let angleA = Math.atan2(d0[1], d0[0]);
        let angleB = Math.atan2(d1[1], d1[0]);

        const sw = d0[0] * d1[1] - d0[1] * d1[0];

        if (sw < 0) {
            const tmp = angleA;
            angleA = angleB;
            angleB = tmp;
        }

        ctx.beginPath();

        ctx.arc(anglePoint[0], anglePoint[1], 50, angleA, angleB);
        ctx.stroke();

        if (part.text) {
            ctx.fillStyle = "white";
            ctx.strokeStyle = "black";
            ctx.lineWidth = 2;
            ctx.font = `bold ${16}px "Open Sans", sans-serif`;

            const textX = anglePoint[0] + dir[0] * 25;
            const textY = anglePoint[1] + dir[1] * 25;
            ctx.translate(textX, textY);
            ctx.strokeText(part.text, 0, 0);
            ctx.fillText(part.text, 0, 0);
            ctx.resetTransform();
        }
        return true;
    }
    return false;
}

function drawLinesOrPolygon(
    ctx: CanvasRenderingContext2D,
    part: DrawPart,
    colorSettings: ColorSettings,
    glMatrix: typeof GlMatrix,
    text?: TextSettings
) {

    const { vec2 } = glMatrix;

    if (part.vertices2D) {
        ctx.beginPath();
        ctx.moveTo(part.vertices2D[0][0], part.vertices2D[0][1]);
        for (let i = 1; i < part.vertices2D.length; ++i) {
            ctx.lineTo(part.vertices2D[i][0], part.vertices2D[i][1]);
        }

        if (part.voids) {
            ctx.closePath();
            part.voids.forEach((drawVoid) => {
                if (drawVoid.vertices2D) {
                    ctx.moveTo(drawVoid.vertices2D[0][0], drawVoid.vertices2D[0][1]);
                    for (let i = 1; i < drawVoid.vertices2D.length; ++i) {
                        ctx.lineTo(drawVoid.vertices2D[i][0], drawVoid.vertices2D[i][1]);
                    }
                    ctx.closePath();
                }
            });
        }

        if (part.drawType === "filled") {
            ctx.closePath();
            ctx.fill();
        }

        if (colorSettings.outlineColor && colorSettings.lineColor) {
            const tmpWidth = ctx.lineWidth;
            ctx.lineWidth *= 2;
            ctx.strokeStyle = colorSettings.outlineColor;
            ctx.lineCap = "round";
            ctx.stroke();
            ctx.lineWidth = tmpWidth;
            ctx.strokeStyle = colorSettings.lineColor;
            ctx.lineCap = "butt";
        }

        ctx.stroke();

        if (colorSettings.pointColor) {
            for (let i = 0; i < part.vertices2D.length; ++i) {
                ctx.fillStyle = getPointColor(colorSettings.pointColor, i, part.vertices2D.length);
                ctx.lineWidth = 2;
                ctx.strokeStyle = "black";
                ctx.beginPath();
                ctx.arc(part.vertices2D[i][0], part.vertices2D[i][1], 5, 0, 2 * Math.PI);
                ctx.fill();
                ctx.stroke();
            }
        }

        if (text && (text.customText?.length || part.text)) {
            ctx.strokeStyle = "black";
            ctx.fillStyle = "white";
            ctx.lineWidth = 2;
            ctx.font = `bold ${16}px "Open Sans", sans-serif`;
            ctx.textBaseline = "bottom";
            ctx.textAlign = "center";

            if (text.type === "distance") {
                const points = part.vertices2D;
                for (let i = 0; i < points.length - 1; ++i) {
                    const textStr = `${text.customText && i < text.customText.length ? text.customText[i] : part.text
                        } ${text.unit ? text.unit : "m"}`;
                    let dir =
                        points[i][0] > points[i + 1][0]
                            ? vec2.sub(vec2.create(), points[i], points[i + 1])
                            : vec2.sub(vec2.create(), points[i + 1], points[i]);
                    const pixLen = ctx.measureText(textStr).width + 20;
                    if (vec2.sqrLen(dir) > pixLen * pixLen) {
                        const center = vec2.create();
                        vec2.lerp(center, points[i], points[i + 1], 0.5);
                        const x = center[0];
                        const y = center[1];
                        vec2.normalize(dir, dir);
                        const angle = Math.atan2(dir[1], dir[0]);
                        ctx.translate(x, y);
                        ctx.rotate(angle);
                        ctx.strokeText(textStr, 0, 0);
                        ctx.fillText(textStr, 0, 0);
                        ctx.resetTransform();
                    }
                }
            } else if (text.type === "center" && part.vertices2D.length > 2) {
                const center = vec2.create();
                for (const p of part.vertices2D) {
                    vec2.add(center, center, p);
                }
                const textStr = `${text.customText && text.customText.length > 0 ? text.customText : part.text ? part.text : ""
                    } ${text.unit ? text.unit : "m"}`;
                ctx.strokeText(textStr, center[0] / part.vertices2D.length, center[1] / part.vertices2D.length);
                ctx.fillText(textStr, center[0] / part.vertices2D.length, center[1] / part.vertices2D.length);
            }
        }
        return true;
    }
    return false;
}

function getPointColor(
    pointColor: string | { start: string; middle: string; end: string; },
    idx: number,
    length: number
) {
    if (typeof pointColor === "string") {
        return pointColor;
    }
    if (idx === 0) {
        return pointColor.start;
    } else if (idx === length - 1) {
        return pointColor.end;
    }
    return pointColor.middle;
}

function drawPoints(ctx: CanvasRenderingContext2D, part: DrawPart, colorSettings: ColorSettings) {
    if (part.vertices2D) {
        for (let i = 0; i < part.vertices2D.length; ++i) {
            ctx.fillStyle = colorSettings.pointColor
                ? getPointColor(colorSettings.pointColor, i, part.vertices2D.length)
                : colorSettings.fillColor ?? "black";
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