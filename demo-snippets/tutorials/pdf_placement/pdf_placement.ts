// HiddenRangeStarted
import * as NovoRender from "@novorender/webgl-api";
import * as MeasureAPI from "@novorender/measure-api";
import * as DataJsAPI from "@novorender/data-js-api";
import * as GlMatrix from "gl-matrix";

export interface IParams {
    webglAPI: NovoRender.API;
    canvas: HTMLCanvasElement;
    measureAPI: typeof MeasureAPI;
    dataJsAPI: typeof DataJsAPI;
    glMatrix: typeof GlMatrix;
    canvas2D: HTMLCanvasElement;
    previewCanvas: HTMLCanvasElement;
}
// HiddenRangeEnded
const DATA_API_SERVICE_URL = "https://data.novorender.com/api";
export async function main({ webglAPI, canvas, dataJsAPI, previewCanvas }: IParams) {
    try {
        // Init
        // Initialize the data API with the Novorender data server service
        const accessToken = await login();
        const dataApi = dataJsAPI.createAPI({
            serviceUrl: DATA_API_SERVICE_URL,
            authHeader: async () => ({
                header: "Authorization",
                value: `Bearer ${accessToken}`,
            }),
        });

        const pdfScene = (await dataApi.loadScene("bad260f94a5340b9b767ea2756392be4")) as DataJsAPI.SceneData;
        console.log('pdfScene==> ', pdfScene);
        const view = await initView(webglAPI, canvas, pdfScene);
        const elevation = await getElevation(view.scene as NovoRender.Scene);
        const preview = await downloadPdfPreview(pdfScene as DataJsAPI.SceneData);
        const context2D = previewCanvas.getContext("2d");
        const img = new Image();
        img.onload = function () {
            console.log('img ', img);

            if (context2D) {
                context2D.drawImage(
                    img,
                    0,
                    0,
                    img.width,
                    img.height,
                    0,
                    0,
                    img.width,
                    img.height
                );
            }
        };
        img.src = preview as string;

        run(view, canvas);

    } catch (e) {
        console.warn("ee ", e);
    }
}

async function login(): Promise<string> {
    // Hardcoded values for demo purposes
    const username = "Novodev";
    const password = "Novodeverbest";

    // POST to the dataserver service's /user/login endpoint
    const res: { token: string; } = await fetch(
        "https://data.novorender.com/api/user/login",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: `username=${username}&password=${password}`,
        }
    )
        .then((res) => res.json())
        .catch(() => {
            // Handle however you like
            return { token: "" };
        });
    return res.token;
}

// HiddenRangeStarted
async function initView(
    api: NovoRender.API,
    canvas: HTMLCanvasElement,
    pdfScene: DataJsAPI.SceneData
): Promise<NovoRender.View> {

    // Destructure relevant properties into variables
    const { url, db, settings, camera: cameraParams } = pdfScene;

    // Load scene
    const scene = await api.loadScene(url, db);

    // Create a view with the scene's saved settings
    const view = await api.createView(settings, canvas);

    // Set resolution scale to 1
    view.applySettings({ quality: { resolution: { value: 1 } } });

    // Create a camera controller with the saved parameters with turntable as fallback
    const camera = cameraParams ?? ({ kind: "flight" } as any);
    view.camera.controller = api.createCameraController(camera, canvas);

    // Assign the scene to the view
    view.scene = scene;

    return view;
}

async function run(
    view: NovoRender.View,
    canvas: HTMLCanvasElement
): Promise<void> {
    // Handle canvas resizes
    const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
            canvas.width = entry.contentRect.width;
            canvas.height = entry.contentRect.height;
            view.applySettings({
                display: { width: canvas.width, height: canvas.height },
            });
        }
    });

    resizeObserver.observe(canvas);

    // Create a bitmap context to display render output
    const ctx = canvas.getContext("bitmaprenderer");

    // Main render loop
    while (true) {
        // Render frame
        const output = await view.render();
        {
            // Finalize output image
            const image = await output.getImage();
            if (image) {
                // Display in canvas
                ctx?.transferFromImageBitmap(image);
                image.close();
            }
        }
    }
}

export async function getElevation(scene: NovoRender.Scene): Promise<string | undefined> {
    const iterator = scene.search({ searchPattern: [{ property: "Novorender/Document/Preview", exact: true }] }, undefined);
    const iteratorResult = await iterator.next();
    const data = await iteratorResult.value.loadMetaData();
    for (const prop of data.properties) {
        if (prop[0] === "Novorender/Document/Preview") {
            //This is the PDF image
            return prop[1];
        }
    }
    return undefined;

}

export async function downloadPdfPreview(scene: DataJsAPI.SceneData): Promise<string | undefined> {

    if (scene.db) {
        const iterator = scene.db.search({ searchPattern: [{ property: "Novorender/Document/Preview", exact: true }] }, undefined);
        const iteratorResult = await iterator.next();
        const data = await iteratorResult.value.loadMetaData();
        for (const prop of data.properties) {

            if (prop[0] === "Novorender/Document/Preview") {
                console.log('scene1212 ', prop);
                //This is the PDF image
                return prop[1];
            }
        }
    }
    return undefined;
}

// HiddenRangeEnded