// should we only use type imports here and pass everything else as params?
import type * as NovoRender from "@novorender/webgl-api";

export function init(canvas: HTMLCanvasElement, webglAPI: NovoRender.API) {
    // provide a camera controller
    const controller = webglAPI.createCameraController({ kind: "orbit" }, canvas);
    return controller;
}
