// HiddenRangeStarted
import * as WebglApi from "@novorender/webgl-api";
import * as MeasureApi from "@novorender/measure-api";
import * as DataJsApi from "@novorender/data-js-api";
import * as GlMatrix from "gl-matrix";

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
    return openAlert(
        "Click to select parametric object, parametric data will be shown in an alert dialog. Select another object and the measurement data between the objects will be shown in the alert dialog. Clicking further objects will alternate between first and second selected and show measure values within an alert dialog.",
    );
}

// HiddenRangeEnded
export async function main({ webglApi, measureApi, canvas }: IParams) {
    // initialize the webgl api
    const api = webglApi.createAPI();

    // initialize the measure api instance
    const _measureApi = await measureApi.createMeasureAPI();

    // load a predefined scene into the measure api, available scenes are cube, oilrig, condos
    const measureScene = await _measureApi.loadScene(webglApi.WellKnownSceneUrls.condos);

    // create a view
    const view = await api.createView({ background: { color: [0, 0, 0.1, 1] } }, canvas);

    // provide a camera controller, available controller types are static, orbit, flight and turntable
    view.camera.controller = api.createCameraController({ kind: "orbit" }, canvas);

    // create an empty scene, other available scenes are cube, oilrig, condos
    view.scene = await api.loadScene(webglApi.WellKnownSceneUrls.condos);

    // create a bitmap context to display render output
    const ctx = canvas.getContext("bitmaprenderer");

    let output: WebglApi.RenderOutput | undefined = undefined;

    // Parametric entities used to measure between
    let measureEntity1: MeasureApi.MeasureEntity | undefined = undefined;
    let measureEntity2: MeasureApi.MeasureEntity | undefined = undefined;
    // number to alternate between selected entities.
    let selectEntity: 1 | 2 = 1;

    canvas.addEventListener("click", async (e) => {
        if (output) {
            const result = await output.pick(e.offsetX, e.offsetY);
            if (result) {
                if (selectEntity === 1) {
                    // Find measure entity at pick location
                    measureEntity1 = (await measureScene.pickMeasureEntity(result.objectId, result.position)).entity;
                    selectEntity = 2;
                } else {
                    // Find measure entity at pick location
                    measureEntity2 = (await measureScene.pickMeasureEntity(result.objectId, result.position)).entity;
                    selectEntity = 1;
                }
                // As long as one object is selected log out the values
                // Note that if measureEntity2 is undefined then the result will be the parametric values of measureEntity1
                if (measureEntity1) {
                    const _log = await measureScene.measure(measureEntity1, measureEntity2);
                    openInfoPane(_log);
                }
            }
        }
    });

    // Handle canvas resizes
    new ResizeObserver((entries) => {
        for (const entry of entries) {
            canvas.width = entry.contentRect.width;
            canvas.height = entry.contentRect.height;
            view.applySettings({
                display: { width: canvas.width, height: canvas.height },
            });
        }
    }).observe(canvas);

    // render loop
    while (true) {
        // Render frame
        output = await view.render();
        {
            // Finalize output image
            const image = await output.getImage();
            if (image) {
                // Display the given ImageBitmap in the canvas associated with this rendering context.
                ctx?.transferFromImageBitmap(image);
                // release bitmap data
                image.close();
            }
        }
        (output as any).dispose();
    }
}
