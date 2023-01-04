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

export async function main({ webglAPI, canvas }: IParams) {
    // create a view
    const view = await webglAPI.createView({ background: { color: [0, 0, 0.1, 1] } }, canvas);

    // provide a camera controller
    view.camera.controller = webglAPI.createCameraController({ kind: "orbit" }, canvas);

    // load scene
    const scene = view.scene = await webglAPI.loadScene(NovoRender.WellKnownSceneUrls.condos);

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
        const width = Math.round(clientWidth * devicePixelRatio);
        const height = Math.round(clientHeight * devicePixelRatio);
        view.applySettings({ display: { width, height } });

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