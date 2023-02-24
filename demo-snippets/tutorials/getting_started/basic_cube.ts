// HiddenRangeStarted
import * as NovoRender from "@novorender/webgl-api";
import * as MeasureAPI from '@novorender/measure-api';
import * as DataJsAPI from '@novorender/data-js-api';
import * as GlMatrix from 'gl-matrix';

export interface IParams {
    webglAPI: NovoRender.API;
    measureAPI: typeof MeasureAPI;
    dataJsAPI: typeof DataJsAPI;
    glMatrix: typeof GlMatrix;
    canvas: HTMLCanvasElement;
    canvas2D: HTMLCanvasElement;
    previewCanvas: HTMLCanvasElement;
};

// HiddenRangeEnded
export async function main({ webglAPI, canvas }: IParams) {
    // Create a view
    const view = await webglAPI.createView({ background: { color: [0, 0, 0.25, 1] } }, canvas);

    // load a predefined scene into the view, available views are cube, oilrig, condos
    view.scene = await webglAPI.loadScene(NovoRender.WellKnownSceneUrls.cube);

    // provide a controller, available controller types are static, orbit, flight and turntable
    view.camera.controller = webglAPI.createCameraController({ kind: "turntable" });

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
