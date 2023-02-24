import moduleInterface from '!!./snippet.ts?raw';
import pinhole from '!!./pick.ts?raw';
import ortho from '!!./pick.ts?raw';
import { demo } from "../../misc";
import * as NovoRender from "@novorender/webgl-api";
import type { SnippetModule } from "./module";

export const objectSelection = {
    ...demo("cameras", "pinhole", pinhole),
    ...demo("cameras", "ortho", ortho),
};

// this function will run entire demo and call into playground snippet for editable code.
async function run(canvas: HTMLCanvasElement, snippet: SnippetModule, state: { readonly exit: boolean; }) {
    const ctx = canvas.getContext("bitmaprenderer");
    const noOffscreenCanvas = !("OffscreenCanvas" in self);
    const webglAPI = NovoRender.createAPI({ noOffscreenCanvas });
    const view = await webglAPI.createView({ background: { color: [0, 0, 0.1, 1] } }, canvas);

    // we interact with snippet module here, but could also interact elsewhere with other function, e.g. in render loop or on mouse clicks etc.
    view.camera.controller = snippet.init(canvas, webglAPI);

    view.scene = await webglAPI.loadScene(NovoRender.WellKnownSceneUrls.empty);
    for (; ;) {
        if (state.exit)
            break;
        function cb() {
            if (state.exit)
                view.invalidateCamera(); // force a re-render to exit the render() function (TODO: make it a return value instead?)
        }

        // handle canvas resizes
        const { clientWidth, clientHeight } = canvas;
        view.applySettings({ display: { width: clientWidth, height: clientHeight } });
        const output = await view.render(cb);
        {
            const image = await output.getImage();
            if (image) {
                ctx?.transferFromImageBitmap(image);
            }
            image?.close();
        }
    }

    // clean up here
    webglAPI.dispose();
}
