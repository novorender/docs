import moduleInterface from '!!./snippet.ts?raw';
import pinhole from '!!./pick.ts?raw';
import ortho from '!!./pick.ts?raw';
import { IDemo } from "../../misc";
import * as NovoRender from "@novorender/webgl-api";
import type { SnippetModule } from "./module";

function demo<T extends string>(name: T, code: string): IDemo {
    return {
        [name]:
            {
                demoName: name,
                config: {
                    clickToRun: true,
                },
                editUrl: `demo-snippets/tutorials/cameras/${name}.ts`,
                code: code,
                previewImageUrl: `assets/demo-screenshots/${name}.png`
            } as const
        // TODO: Add thse to IDemo interface
        // run, 
        // moduleInterface
    } as const;
}

export const objectSelection = {
    ...demo("pinhole", pinhole),
    ...demo("ortho", ortho),
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
        const width = Math.round(clientWidth * devicePixelRatio);
        const height = Math.round(clientHeight * devicePixelRatio);
        view.applySettings({ display: { width, height } });
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
