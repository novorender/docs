// HiddenRangeStarted
import * as WebglApi from "@novorender/webgl-api";
import * as MeasureApi from '@novorender/measure-api';
import * as DataJsApi from '@novorender/data-js-api';
import * as GlMatrix from 'gl-matrix';

export interface IParams {
    webglApi: typeof WebglApi;
    measureApi: typeof MeasureApi;
    dataJsApi: typeof DataJsApi;
    glMatrix: typeof GlMatrix;
    canvas: HTMLCanvasElement;
    canvas2D: HTMLCanvasElement;
    previewCanvas: HTMLCanvasElement;
};

// HiddenRangeEnded
export async function main({ webglApi, canvas }: IParams) {

    const { createView, createCameraController, loadScene } = webglApi.createAPI();

    // create a view
    const view = await createView({ background: { color: [0, 0, 0.1, 1] } }, canvas);

    // provide a camera controller
    view.camera.controller = createCameraController({ kind: "orbit" }, canvas);

    // load scene
    const scene = view.scene = await loadScene(webglApi.WellKnownSceneUrls.condos);

    // get center of scene
    const [cx, cy, cz] = scene.boundingSphere.center;

    // apply clipping volume
    view.applySettings({
        clippingVolume: {
            enabled: true,
            mode: "union",
            planes: [
                [1, 0, 0, -(cx + 5)] // offset plane
            ]
        }
    });

    // create a bitmap context to display render output
    const ctx = canvas.getContext("bitmaprenderer");

    // main render loop
    for (; ;) {
        // handle canvas resizes
        const { clientWidth, clientHeight } = canvas;
        view.applySettings({ display: { width: clientWidth, height: clientHeight } });

        // render frame
        const output = await view.render();
        {
            // finalize output image
            const image = await output.getImage();
            if (image) {
                // display in canvas
                ctx?.transferFromImageBitmap(image);
                image.close();
            }
        }
    }
}
