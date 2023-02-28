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

    // initialize the webgl api
    const api = webglApi.createAPI();

    // Create a view
    const view = await api.createView({ background: { color: [0, 0, 0.25, 1] } }, canvas);

    // load a predefined scene into the view, available scenes are cube, oilrig, condos
    view.scene = await api.loadScene(webglApi.WellKnownSceneUrls.cube);

    // provide a controller, available controller types are static, orbit, flight and turntable
    view.camera.controller = api.createCameraController({ kind: "turntable" });

    // Create a bitmap context to display render output
    const ctx = canvas.getContext("bitmaprenderer");

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

    while (true) { // render-loop https://dens.website/tutorials/webgl/render-loop
        // Render frame
        const output = await view.render();
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
