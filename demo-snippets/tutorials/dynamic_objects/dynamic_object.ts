// HiddenRangeStarted
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

// HiddenRangeEnded
export async function main({ webglAPI, canvas }: IParams) {
    // create a view
    const view = await webglAPI.createView({ background: { color: [0, 0, 0.1, 1] } }, canvas);

    // provide a camera controller
    view.camera.controller = webglAPI.createCameraController({ kind: "orbit" }, canvas);

    // create an empty scene
    const scene = view.scene = await webglAPI.loadScene(NovoRender.WellKnownSceneUrls.empty);

    // load dynamic object asset
    const asset = await webglAPI.loadAsset(new URL("https://api.novorender.com/assets/gltf/shaderball.glb"));

    // Add instance into scene
    const instance = scene.createDynamicObject(asset); // we can make multiple instances from same asset.
    instance.visible = true;

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
            }
            image?.close();
        }
    }
}
