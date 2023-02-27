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

    // Create a view
    const view = await createView({ background: { color: [0, 0, 0.25, 1] } }, canvas);

    // load a predefined scene into the view, available views are cube, oilrig, condos
    view.scene = await loadScene(webglApi.WellKnownSceneUrls.cube);

    // provide a controller, available controller types are static, orbit, flight and turntable
    view.camera.controller = createCameraController({ kind: "turntable" });

    const ctx = canvas.getContext("bitmaprenderer");
    for (; ;) { // render-loop https://dens.website/tutorials/webgl/render-loop

        const { clientWidth, clientHeight } = canvas;
        // handle resizes
        view.applySettings({ display: { width: clientWidth, height: clientHeight } });
        const output = await view.render();

        {
            const image = await output.getImage();
            if (image) {
                // display in canvas
                ctx?.transferFromImageBitmap(image);
            }
        }
        (output as any).dispose();
    }
}
