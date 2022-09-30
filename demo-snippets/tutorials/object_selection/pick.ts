import * as NovoRender from "@novorender/webgl-api";

export async function main(api: NovoRender.API, canvas: HTMLCanvasElement) {
    // create a view
    const view = await api.createView({ background: { color: [0, 0, 0.1, 1] } }, canvas);

    // provide a camera controller
    view.camera.controller = api.createCameraController({ kind: "flight" }, canvas);

    // create an empty scene
    const scene = view.scene = await api.loadScene(NovoRender.WellKnownSceneUrls.condos);

    // create a bitmap context to display render output
    const ctx = canvas.getContext("bitmaprenderer");

    // make object highlights
    const highlightGroup0 = api.createHighlight({ kind: "hsla", saturation: 0.5 });
    const highlightGroup1 = api.createHighlight({ kind: "color", color: [0, 1, 0] });
    view.settings.objectHighlights = [highlightGroup0, highlightGroup1];

    // Make a simple state object that we can share between mouse events and render loop
    const state = { output: undefined as NovoRender.RenderOutput | undefined };

    // Add mouse click event handler to pick objects
    canvas.addEventListener("click", async (e) => {
        await view.updatePickBuffers();
        const result = await state.output?.pick(e.offsetX, e.offsetY);
        if (result) {
            const { objectId } = result;
            scene.objectHighlighter.objectHighlightIndices[objectId] = 1;
            scene.objectHighlighter.commit();
        }
    });

    // main render loop
    for (; ;) {
        // handle canvas resizes
        const { clientWidth, clientHeight } = canvas;
        const width = Math.round(clientWidth);
        const height = Math.round(clientHeight);
        view.applySettings({ display: { width, height } });

        // render frame
        state.output = await view.render();
        {
            // finalize output image
            const image = await state.output.getImage();
            if (image) {
                // display in canvas
                ctx?.transferFromImageBitmap(image);
            }
            image?.close();
        }
    }
}
