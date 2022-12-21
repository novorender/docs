import * as NovoRender from "@novorender/webgl-api";
//Please fix measure api import
import * as Measure from "@novorender/measure-api";
import { vec3 } from "gl-matrix";

export async function main(api: NovoRender.API, canvas: HTMLCanvasElement) {
    const measureApi = await Measure.createMeasureAPI();
    measureApi.loadScene(NovoRender.WellKnownSceneUrls.condos);

    // create a view
    const view = await api.createView({ background: { color: [0, 0, 0.1, 1] } }, canvas);

    // provide a camera controller
    view.camera.controller = api.createCameraController({ kind: "orbit" }, canvas);

    // create an empty scene
    const scene = view.scene = await api.loadScene(NovoRender.WellKnownSceneUrls.condos);

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
