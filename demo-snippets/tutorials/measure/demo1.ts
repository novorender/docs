import * as NovoRender from "@novorender/webgl-api";
import * as Measure from "@novorender/measure-api";
import { vec3 } from "gl-matrix";

export async function main(api: NovoRender.API, canvas: HTMLCanvasElement, measureApi: typeof Measure) {
    const _measureApi = await measureApi.createMeasureAPI();
    _measureApi.loadScene(NovoRender.WellKnownSceneUrls.condos);
    const measureScene = await _measureApi.loadScene(NovoRender.WellKnownSceneUrls.condos);


    // create a view
    const view = await api.createView({ background: { color: [0, 0, 0.1, 1] } }, canvas);
    // provide a camera controller
    view.camera.controller = api.createCameraController({ kind: "orbit" }, canvas);

    // create an empty scene
    const scene = view.scene = await api.loadScene(NovoRender.WellKnownSceneUrls.condos);

    // create a bitmap context to display render output
    const ctx = canvas.getContext("bitmaprenderer");

    let currentOutput: NovoRender.RenderOutput | undefined = undefined;

    let measureEntity1: Measure.MeasureEntity | undefined = undefined;
    let measureEntity2: Measure.MeasureEntity | undefined = undefined;
    let selectEntity: 1 | 2 = 1;

    canvas.addEventListener("click", async (e) => {
        if (currentOutput) {
            const result = await currentOutput.pick(e.offsetX, e.offsetY);
            if (result) {
                if (selectEntity === 1) {
                    measureEntity1 = await measureScene.pickMeasureEntity(
                        result.objectId,
                        result.position
                    );
                    selectEntity = 2;
                }
                else {
                    measureEntity2 = await measureScene.pickMeasureEntity(
                        result.objectId,
                        result.position
                    );
                    selectEntity = 1;
                }
                if (measureEntity1) {
                    console.log(measureScene.measure(measureEntity1, measureEntity2));
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
    }
}
