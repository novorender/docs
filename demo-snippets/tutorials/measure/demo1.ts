import * as NovoRender from "@novorender/webgl-api";
import * as MeasureAPI from '@novorender/measure-api';
import * as DataJsAPI from '@novorender/data-js-api';
import * as GlMatrix from 'gl-matrix';

export interface IParams {
    webglAPI: NovoRender.API;
    canvas: HTMLCanvasElement;
    measureAPI: typeof MeasureAPI;
    dataJsAPI: typeof DataJsAPI;
    glMatrix: typeof GlMatrix;
    canvas2D: HTMLCanvasElement;
};

export async function main({ webglAPI, canvas, measureAPI }: IParams) {
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

    let currentOutput: NovoRender.RenderOutput | undefined = undefined;

    // Parametric entities used to measure between
    let measureEntity1: MeasureAPI.MeasureEntity | undefined = undefined;
    let measureEntity2: MeasureAPI.MeasureEntity | undefined = undefined;
    // number to alternate between selected entities.
    let selectEntity: 1 | 2 = 1;

    canvas.addEventListener("click", async (e) => {
        if (currentOutput) {
            const result = await currentOutput.pick(e.offsetX, e.offsetY);
            if (result) {
                if (selectEntity === 1) {
                    // Find measure entity at pick location
                    measureEntity1 = await measureScene.pickMeasureEntity(
                        result.objectId,
                        result.position
                    );
                    selectEntity = 2;
                }
                else {
                    // Find measure entity at pick location
                    measureEntity2 = await measureScene.pickMeasureEntity(
                        result.objectId,
                        result.position
                    );
                    selectEntity = 1;
                }
                // As long as one object is selected log out the values
                // Note that if measureEntity2 is undefined then the result will be the parametric values of measureEntity1
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
