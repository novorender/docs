import { type DrawPart, type DrawProduct, type View } from "@novorender/api";
import { type ReadonlyVec2, type ReadonlyVec3, vec2, vec3 } from "gl-matrix";

export async function main(view: View, canvas2D: HTMLCanvasElement, center: ReadonlyVec3) {
    const context2D = canvas2D.getContext("2d");
    let currentPointIndex = 0;
    let outlineValues: OutlineIntersection | undefined;
    const [cx, cy, cz] = center;

    view.modifyRenderState({
        clipping: {
            enabled: true,
            planes: [{ normalOffset: [1, 0, 0, cx], outline: { enabled: true, lineColor: [0, 1, 1] } }],
        }
    });

    view.canvas.onclick = async (e: MouseEvent) => {
        const result = await view.pick(e.offsetX, e.offsetY);
        if (result) {
            outlineValues = view.outlineLaser(result.position, "clipping", 0);
            currentPointIndex = 0;
            await drawLines(outlineValues?.left[currentPointIndex], outlineValues?.right[currentPointIndex], outlineValues?.up[currentPointIndex], outlineValues?.down[currentPointIndex]);
        }
    };

    const drawLines = async (left: ReadonlyVec3 | undefined, right: ReadonlyVec3 | undefined, up: ReadonlyVec3 | undefined, down: ReadonlyVec3 | undefined) => {
        if (outlineValues && context2D) {
            await drawLine(canvas2D, context2D, view, left, right, up, down);
        }
    };

    // HiddenRangeStarted
    await sleep(500); // we need to sleep to make sure animate correctly overrides demo host's internal animate - you probably don't need this
    view.animate = async () => {
        if (outlineValues) {
            await drawLines(outlineValues?.left[currentPointIndex], outlineValues?.right[currentPointIndex], outlineValues?.up[currentPointIndex], outlineValues?.down[currentPointIndex]);
        }
    };

    createFloorButtons(view.canvas.parentElement!, async (label: string) => {
        console.log("clicked on btn ", label);
        if (!outlineValues) { alert("Click anywhere on the model to select points first"); }
        if (label === "Show Previous") {
            console.log("Showing pre ", currentPointIndex);
            if (currentPointIndex > 0) {
                --currentPointIndex;
                await drawLines(outlineValues?.left[currentPointIndex], outlineValues?.right[currentPointIndex], outlineValues?.up[currentPointIndex], outlineValues?.down[currentPointIndex]);
            }
        } else {
            ++currentPointIndex;
            await drawLines(outlineValues?.left[currentPointIndex], outlineValues?.right[currentPointIndex], outlineValues?.up[currentPointIndex], outlineValues?.down[currentPointIndex]);
        }
    });
    async function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }
    // HiddenRangeEnded
}



export type OutlineIntersection = {
    left: ReadonlyVec3[],
    right: ReadonlyVec3[],
    up: ReadonlyVec3[],
    down: ReadonlyVec3[],
};

/**
 * Utility functions copied from our frontend (https://github.com/novorender/novoweb/blob/develop/src/features/engine2D/utils.ts)
*/

async function drawLine(canvas: HTMLCanvasElement, context2D: CanvasRenderingContext2D, view: View, point1: ReadonlyVec3 | undefined, point2: ReadonlyVec3 | undefined, point3: ReadonlyVec3 | undefined, point4: ReadonlyVec3 | undefined): Promise<void> {
    // Extract needed camera settings
    const measureView = await view.measure;
    const { rotation, position } = view.renderState.camera;
    const cameraDirection = vec3.transformQuat(vec3.create(), vec3.fromValues(0, 0, -1), rotation);
    const camSettings = { pos: position, dir: cameraDirection };
    const drawProd1 = point2 ? measureView?.draw.getDrawObjectFromPoints([point1 as ReadonlyVec3, point2], { angles: false, closed: false }) : measureView?.draw.getDrawObjectFromPoints([point1 as ReadonlyVec3], { angles: false, closed: false });
    const drawProd2 = point4 ? measureView?.draw.getDrawObjectFromPoints([point3 as ReadonlyVec3, point4], { angles: false, closed: false }) : measureView?.draw.getDrawObjectFromPoints([point3 as ReadonlyVec3], { angles: false, closed: false });
    if (drawProd1 && drawProd2) {
        context2D.clearRect(0, 0, canvas.width, canvas.height);
        // Draw result in green, all lines use 3 pixel width
        drawProduct(context2D, camSettings, drawProd1, drawProd2, { type: "centerOfLine", unit: "m", customText: point2 ? [vec3.distance(point1 as ReadonlyVec3, point2).toFixed(3)] : [] });
    }
}

interface ColorSettings {
    lineColor?: string | CanvasGradient | string[];
    fillColor?: string;
    pointColor?: string | { start: string; middle: string; end: string; };
    outlineColor?: string;
    complexCylinder?: boolean;
    displayAllPoints?: boolean;
}

interface TextSettings {
    type: "centerOfLine" | "center" | "default";
    unit?: string;
    customText?: string[];
}

interface CameraSettings {
    pos: ReadonlyVec3;
    dir: ReadonlyVec3;
}

type CapStyle = "arrow";

interface LineCap {
    end?: CapStyle;
    start?: CapStyle;
}

function drawProduct(ctx: CanvasRenderingContext2D, camera: CameraSettings, product1: DrawProduct, product2: DrawProduct, textSettings?: TextSettings, lineCap?: LineCap) {
    const pixelWidth = 3;
    for (const obj of product1.objects) {
        obj.parts.forEach((part) => {
            if (part.drawType === "text" && !textSettings) {
                return;
            }
            drawPart(ctx, camera, part, { lineColor: "green", displayAllPoints: true }, pixelWidth, textSettings, lineCap);
        });
    }
    for (const obj of product2.objects) {
        obj.parts.forEach((part) => {
            if (part.drawType === "text" && !textSettings) {
                return;
            }
            drawPart(ctx, camera, part, { lineColor: "yellow", displayAllPoints: true }, pixelWidth, textSettings, lineCap);
        });
    }
}

function drawPart(ctx: CanvasRenderingContext2D, camera: CameraSettings, part: DrawPart, colorSettings: ColorSettings, pixelWidth: number, textSettings?: TextSettings, lineCap?: LineCap): boolean {
    if (part.vertices2D) {
        ctx.lineWidth = pixelWidth;
        ctx.fillStyle = colorSettings.fillColor ?? "transparent";
        ctx.strokeStyle = getLineColor(colorSettings.lineColor, 0);
        if (part.drawType === "angle" && part.vertices2D.length === 3 && part.text) {
            return drawAngle(ctx, camera, part);
        } else if (part.drawType === "text") {
            return drawTextPart(ctx, part);
        } else if (part.drawType === "lines" || part.drawType === "filled") {
            return drawLinesOrPolygon(ctx, part, colorSettings, textSettings, lineCap);
        } else if (part.drawType === "vertex") {
            return drawPoints(ctx, part, colorSettings);
        }
    }
    return false;
}
function drawTextPart(ctx: CanvasRenderingContext2D, part: DrawPart) {
    if (part.drawType === "text" && !Array.isArray(part.text) && part.text && part.vertices2D) {
        return drawText(ctx, part.vertices2D, part.text);
    }
    return false;
}

function drawAngle(ctx: CanvasRenderingContext2D, camera: CameraSettings, part: DrawPart) {
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

        if (part.text && !Array.isArray(part.text)) {
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

function drawLinesOrPolygon(ctx: CanvasRenderingContext2D, part: DrawPart, colorSettings: ColorSettings, text?: TextSettings, lineCap?: LineCap) {
    const lineColArray = colorSettings.lineColor !== undefined && Array.isArray(colorSettings.lineColor);
    if (part.vertices2D) {
        if (lineCap?.start === "arrow") {
            const dir = vec2.sub(vec2.create(), part.vertices2D[1], part.vertices2D[0]);
            ctx.fillStyle = colorSettings.outlineColor ?? "black";
            vec2.normalize(dir, dir);
            drawArrow(ctx, part.vertices2D[0], dir, 20);
        }
        ctx.beginPath();
        ctx.moveTo(part.vertices2D[0][0], part.vertices2D[0][1]);

        for (let i = 1; i < part.vertices2D.length; ++i) {
            ctx.lineTo(part.vertices2D[i][0], part.vertices2D[i][1]);
            if (lineCap?.end === "arrow") {
                ctx.fillStyle = colorSettings.outlineColor ?? "black";
                ctx.stroke();
                const dir = vec2.sub(vec2.create(), part.vertices2D[i], part.vertices2D[i - 1]);
                vec2.normalize(dir, dir);
                drawArrow(ctx, part.vertices2D[i], dir, 20);
                ctx.beginPath();
                ctx.moveTo(part.vertices2D[i][0], part.vertices2D[i][1]);
            }
            if (lineColArray) {
                ctx.strokeStyle = getLineColor(colorSettings.lineColor, i - 1);
                ctx.lineCap = "butt";
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(part.vertices2D[i][0], part.vertices2D[i][1]);
            }
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

        if (colorSettings.outlineColor && colorSettings.lineColor && !lineColArray) {
            const tmpWidth = ctx.lineWidth;
            ctx.lineWidth *= 2;
            ctx.strokeStyle = colorSettings.outlineColor;
            ctx.lineCap = "round";
            ctx.stroke();
            ctx.lineWidth = tmpWidth;
            ctx.strokeStyle = getLineColor(colorSettings.lineColor, 0);
            ctx.lineCap = "butt";
        }

        ctx.stroke();

        if (colorSettings.displayAllPoints) {
            for (let i = 0; i < part.vertices2D.length; ++i) {
                ctx.fillStyle = colorSettings.pointColor ? getPointColor(colorSettings.pointColor, i, part.vertices2D.length) : colorSettings.fillColor ?? "black";
                ctx.lineWidth = 2;
                ctx.strokeStyle = "black";
                ctx.beginPath();
                ctx.arc(part.vertices2D[i][0], part.vertices2D[i][1], 5, 0, 2 * Math.PI);
                ctx.fill();
                ctx.stroke();
            }
        }

        if (text && (text.customText?.length || part.text)) {
            if (text.type === "centerOfLine") {
                const points = part.vertices2D;
                for (let i = 0; i < points.length - 1; ++i) {
                    let textStr = `${text.customText && i < text.customText.length ? text.customText[i] : part.text}`;
                    if (textStr.length === 0) {
                        continue;
                    }
                    textStr += `${text.unit ? text.unit : "m"}`;
                    drawText(ctx, [points[i], points[i + 1]], textStr);
                }
            } else if (text.type === "center" && part.vertices2D.length > 2) {
                const textStr = `${text.customText && text.customText.length > 0 ? text.customText : part.text ? part.text : ""} ${text.unit ? text.unit : "m"}`;
                drawText(ctx, part.vertices2D, textStr);
            } else if (part.text && Array.isArray(part.text) && part.text.length > 0) {
                const points = part.vertices2D;
                for (let i = 0; i < points.length - 1 && i < part.text[0].length; ++i) {
                    if (part.text[0][i].length === 0) {
                        continue;
                    }
                    const textStr = part.text[0][i] + `${text.unit ? text.unit : "m"}`;
                    drawText(ctx, [points[i], points[i + 1]], textStr);
                }
                if (part.voids) {
                    for (let j = 0; j < part.voids.length && j < part.text.length - 1; ++j) {
                        const voidVerts = part.voids[j].vertices2D;
                        if (voidVerts) {
                            for (let i = 0; i < voidVerts.length - 1 && i < part.text[j].length; ++i) {
                                if (part.text[j + 1][i].length === 0) {
                                    continue;
                                }
                                const textStr = part.text[j + 1][i] + `${text.unit ? text.unit : "m"}`;
                                drawText(ctx, [voidVerts[i], voidVerts[i + 1]], textStr);
                            }
                        }
                    }
                }
            }
        }
        return true;
    }
    return false;
}

function getLineColor(lineColor: string | CanvasGradient | string[] | undefined, idx: number) {
    if (lineColor) {
        return Array.isArray(lineColor) ? (idx < lineColor.length ? lineColor[idx] : lineColor[lineColor.length - 1]) : lineColor;
    }
    return "black";
}

function getPointColor(pointColor: string | { start: string; middle: string; end: string; }, idx: number, length: number) {
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
            ctx.fillStyle = colorSettings.pointColor ? getPointColor(colorSettings.pointColor, i, part.vertices2D.length) : colorSettings.fillColor ?? "black";
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

function drawText(ctx: CanvasRenderingContext2D, vertices2D: ReadonlyVec2[], text: string) {
    ctx.strokeStyle = "black";
    ctx.fillStyle = "white";
    ctx.lineWidth = 2;
    ctx.font = `bold ${16}px "Open Sans", sans-serif`;
    ctx.textBaseline = "bottom";
    ctx.textAlign = "center";
    if (vertices2D.length === 1) {
        ctx.strokeText(text, vertices2D[0][0], vertices2D[0][1]);
        ctx.fillText(text, vertices2D[0][0], vertices2D[0][1]);
    } else if (vertices2D.length === 2) {
        const dir = vertices2D[0][0] > vertices2D[1][0] ? vec2.sub(vec2.create(), vertices2D[0], vertices2D[1]) : vec2.sub(vec2.create(), vertices2D[1], vertices2D[0]);
        const pixLen = ctx.measureText(text).width + 20;
        if (vec2.sqrLen(dir) > pixLen * pixLen) {
            const center = vec2.create();
            vec2.lerp(center, vertices2D[0], vertices2D[1], 0.5);
            const x = center[0];
            const y = center[1];
            vec2.normalize(dir, dir);
            const angle = Math.atan2(dir[1], dir[0]);
            ctx.translate(x, y);
            ctx.rotate(angle);
            ctx.strokeText(text, 0, 0);
            ctx.fillText(text, 0, 0);
            ctx.resetTransform();
        }
    } else {
        const center = vec2.create();
        for (const p of vertices2D) {
            vec2.add(center, center, p);
        }
        ctx.strokeText(text, center[0] / vertices2D.length, center[1] / vertices2D.length);
        ctx.fillText(text, center[0] / vertices2D.length, center[1] / vertices2D.length);
    }
    return true;
}

function drawArrow(ctx: CanvasRenderingContext2D, currentPos: ReadonlyVec2, dir: ReadonlyVec2, pixels: number) {
    const scaledDir = vec2.scale(vec2.create(), dir, pixels);
    ctx.beginPath();
    ctx.moveTo(currentPos[0], currentPos[1]);
    ctx.lineTo(currentPos[0] + scaledDir[1] / 2, currentPos[1] - scaledDir[0] / 2);
    ctx.lineTo(currentPos[0] + scaledDir[0], currentPos[1] + scaledDir[1]);
    ctx.lineTo(currentPos[0] - scaledDir[1] / 2, currentPos[1] + scaledDir[0] / 2);
    ctx.closePath();
    ctx.fill();
}

// HiddenRangeStarted
// UI setup
function createFloorButtons(container: HTMLElement, onClick: (value: string) => void): void {
    const wrapper = document.createElement("div");
    wrapper.style.position = "absolute";
    wrapper.style.top = "0";
    ["Show Previous", "Show Next"].forEach((label) => {
        const btn = document.createElement("button");
        btn.style.marginRight = "2px";
        btn.innerText = label;
        btn.onclick = () => {
            onClick(label);
        };
        wrapper.append(btn);
    });
    // const btn = document.createElement("button");
    // btn.innerText = "All";
    // btn.onclick = () => {
    //     onClick();
    // };
    // wrapper.append(btn);
    container.append(wrapper);
}
// HiddenRangeEnded