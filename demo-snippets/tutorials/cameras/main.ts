// import moduleInterface from '!!./snippet.ts?raw';
import type * as NovoRender from "@novorender/webgl-api";
import type * as MeasureAPI from '@novorender/measure-api';
import type * as DataJsAPI from '@novorender/data-js-api';
import type * as GlMatrix from 'gl-matrix';
import type { DrawPart, DrawProduct } from "@novorender/measure-api";
import type { SnippetModule } from "./module";

export interface IParams {
    webglAPI: typeof NovoRender;
    canvas: HTMLCanvasElement;
    measureAPI: typeof MeasureAPI;
    dataJsAPI: typeof DataJsAPI;
    glMatrix: typeof GlMatrix;
    canvas2D: HTMLCanvasElement;
    snippet: { init: any } // @todo: implement proper type
};


// this function will run entire demo and call into playground snippet for editable code.
export async function main({ canvas, webglAPI, snippet }: IParams) {

    const ctx = canvas.getContext("bitmaprenderer");
    const noOffscreenCanvas = !("OffscreenCanvas" in self);
    const _webglAPI = webglAPI.createAPI({ noOffscreenCanvas });
    const view = await _webglAPI.createView({ background: { color: [0, 0, 0.1, 1] } }, canvas);

    // we interact with snippet module here, but could also interact elsewhere with other function, e.g. in render loop or on mouse clicks etc.
    view.camera.controller = snippet.init(canvas, _webglAPI);

    view.scene = await _webglAPI.loadScene(webglAPI.WellKnownSceneUrls.cube);
    for (; ;) {
        // if (state.exit)
        //     break;
        function cb() {
            // if (state.exit)
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
    _webglAPI.dispose();
}
