import * as NovoRender from "@novorender/webgl-api";
import { vec3 } from "gl-matrix";

export async function main(api: NovoRender.API, canvas: HTMLCanvasElement) {
    // create a view
    const view = await api.createView({ background: { color: [0, 0, 0.1, 1] } }, canvas);

    // provide a camera controller
    view.camera.controller = api.createCameraController({ kind: "orbit" }, canvas);

    // load scene
    const scene = view.scene = await api.loadScene(NovoRender.WellKnownSceneUrls.condos);

    // get center of scene
    const [cx, cy, cz] = scene.boundingSphere.center;

    // apply clipping volume
    view.applySettings({
        clippingVolume: {
            enabled: true,
            mode: "union",
            planes: [
                [1, 0, 0, -cx]
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
