/**
 * every snippet file must follow the same structure as below.
 */

import { NovoRender } from "@site/type-definitions/webgl-api";



// used for screenshot file name or editor title. 
const demoName: string = 'dynamic-objects';

const main = `
export async function main(api: NovoRender.API, canvas:HTMLCanvasElement) {
    // Create a view
    const view = await api.createView({ background: { color: [0, 0, 10, 1] } }, canvas);

    // load a predefined scene into the view, available views are cube, oilrig, condos
    view.scene = await api.loadScene(NovoRender.WellKnownSceneUrls.condos);

    // provide a controller, available controller types are static, orbit, flight and turntable
    view.camera.controller = api.createCameraController({ kind: "flight" }, canvas);

    const ctx = canvas.getContext("bitmaprenderer");
    for (; ;) { // render-loop https://dens.website/tutorials/webgl/render-loop

            const { clientWidth: width, clientHeight: height } = canvas;
            // handle resizes
            view.applySettings({ display: { width, height } });
            const output = await view.render();
            {
                    const image = await output.getImage();
                    if (image) {
                            // display in canvas
                            ctx.transferFromImageBitmap(image);
                    }
            }
            (output as any).dispose();
    }

}
`


export {
    // renderSettings,
    // scene,
    demoName,
    main
    // cameraController
};
