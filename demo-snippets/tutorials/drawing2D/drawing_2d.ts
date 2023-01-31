import * as NovoRender from "@novorender/webgl-api";
import * as MeasureAPI from '@novorender/measure-api';
import * as DataJsAPI from '@novorender/data-js-api';
import * as GlMatrix from 'gl-matrix';
import type { DrawPart, DrawProduct } from "@novorender/measure-api";

export interface IParams {
    webglAPI: NovoRender.API;
    canvas: HTMLCanvasElement;
    measureAPI: typeof MeasureAPI;
    dataJsAPI: typeof DataJsAPI;
    glMatrix: typeof GlMatrix;
    canvas2D: HTMLCanvasElement;
};


//Begin example snippet
async function draw2d(_measureApi: MeasureAPI.MeasureAPI, view: NovoRender.View, measureScene: MeasureAPI.MeasureScene,
    measureEntity1: MeasureAPI.MeasureEntity | undefined, measureEntity2: MeasureAPI.MeasureEntity | undefined, context2D: CanvasRenderingContext2D | null,
    canvas2D: HTMLCanvasElement, result: MeasureAPI.DuoMeasurementValues | undefined, glMatrix: typeof GlMatrix) {
    //Await all draw objects first to avoid flickering
    const [
        drawResult,
        drawProduct1,
        drawProduct2,
    ] = await Promise.all([
        result && _measureApi.getDrawMeasureEntity(view, measureScene, result),
        measureEntity1 && _measureApi.getDrawMeasureEntity(view, measureScene, measureEntity1),
        measureEntity2 && _measureApi.getDrawMeasureEntity(view, measureScene, measureEntity2)
    ]);

    //Extract needed camera settings
    const { camera } = view;
    const cameraDirection = glMatrix.vec3.transformQuat(glMatrix.vec3.create(), glMatrix.vec3.fromValues(0, 0, -1), camera.rotation);
    const camSettings = { pos: camera.position, dir: cameraDirection };

    if (context2D) {
        context2D.clearRect(0, 0, canvas2D.width, canvas2D.height);

        //Draw result in green, all lines use 3 pixel width
        if (drawResult) {
            drawProduct(context2D as CanvasRenderingContext2D,
                camSettings,
                drawResult,
                { lineColor: "green" },
                3,
                glMatrix);
        }

        //Draw first object with yellow line and blue fill
        if (drawProduct1) {
            drawProduct(context2D as CanvasRenderingContext2D,
                camSettings,
                drawProduct1,
                { lineColor: "yellow", fillColor: "blue" },
                3,
                glMatrix);
        }

        //Draw second object with blue lines and yellow fill 
        if (drawProduct2) {
            drawProduct(context2D as CanvasRenderingContext2D,
                camSettings,
                drawProduct2,
                { lineColor: "blue", fillColor: "yellow" },
                3,
                glMatrix);
        }
    }
}
//End example snippet


export async function main({ webglAPI, canvas, glMatrix, canvas2D, measureAPI }: IParams) {

    const { vec2, vec3 } = glMatrix;

    const _measureApi = await measureAPI.createMeasureAPI();
    _measureApi.loadScene(NovoRender.WellKnownSceneUrls.condos);
    const measureScene = await _measureApi.loadScene(NovoRender.WellKnownSceneUrls.condos);


    // create a view
    const view = await webglAPI.createView({ background: { color: [0, 0, 0.1, 1] } }, canvas);
    // provide a camera controller
    view.camera.controller = webglAPI.createCameraController({ kind: "orbit" }, canvas);

    // create an empty scene
    const scene = view.scene = await webglAPI.loadScene(NovoRender.WellKnownSceneUrls.condos);

    // create a bitmap context to display render output
    const ctx = canvas.getContext("bitmaprenderer");
    const context2D = canvas2D.getContext("2d");

    let currentOutput: NovoRender.RenderOutput;

    //Parametric entities used to measure between
    let measureEntity1: MeasureAPI.MeasureEntity | undefined = undefined;
    let measureEntity2: MeasureAPI.MeasureEntity | undefined = undefined;
    //number to alternate between selected entities.
    let selectEntity: 1 | 2 = 1;

    //Save the measure result so it can be drawn in the draw loop
    let result: MeasureAPI.MeasurementValues | undefined = undefined;


    canvas.addEventListener("click", async (e) => {
        if (currentOutput) {
            let result1 = await currentOutput.pick(e.offsetX, e.offsetY);
            if (result1) {
                if (selectEntity === 1) {
                    //Find measure entity at pick location
                    measureEntity1 = (await measureScene.pickMeasureEntity(
                        result1.objectId,
                        result1.position
                    )).entity;
                    selectEntity = 2;
                }
                else {
                    //Find measure entity at pick location
                    measureEntity2 = (await measureScene.pickMeasureEntity(
                        result1.objectId,
                        result1.position
                    )).entity;
                    selectEntity = 1;
                }
                //As long as one object is selected log out the values
                //Note that if measureEntity2 is undefined then the result will be the parametric values of measureEntity1
                if (measureEntity1) {
                    result = await measureScene.measure(measureEntity1, measureEntity2);
                }
            }
        }
    });


    // main render loop
    for (; ;) {
        // handle canvas resizes
        const { clientWidth, clientHeight } = canvas;
        const width = Math.round(clientWidth * devicePixelRatio);
        const height = Math.round(clientHeight * devicePixelRatio);
        view.applySettings({ display: { width, height } });

        // render frame
        currentOutput = await view.render();
        {
            // finalize output image
            const image = await currentOutput.getImage();
            if (image) {
                // display in canvas
                ctx?.transferFromImageBitmap(image);
            }
            image?.close();
        }
        draw2d(_measureApi, view, measureScene, measureEntity1, measureEntity2, context2D, canvas2D, result, glMatrix);
    }
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
        if (part.drawType === "angle" && part.vertices2D.length === 3 && part.text) {
            return drawAngle(ctx, camera, part, glMatrix);
        } else if (part.drawType === "lines" || part.drawType === "filled") {
            return drawLinesOrPolygon(ctx, part, colorSettings, glMatrix, textSettings);
        } else if (part.drawType === "vertex") {
            return drawPoints(ctx, part, colorSettings);
        }
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
