"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const puppeteer_1 = __importDefault(require("puppeteer"));
const path = __importStar(require("path"));
const { configPath } = require('yargs').argv;
const demo_snippets_1 = require("../demo-snippets");
(async () => {
    // if (!configPath) {
    //     throw new Error('Parameter `configPath` not provided or invalid, please pass using `-- --configPath=<path>`');
    // }
    // let config: IConfig;
    // try {
    //     // get the config file
    //     config = require(path.join(process.cwd(), configPath));
    // } catch (error) {
    //     throw new Error(`config file ${configPath} not found, path must be relative to the current working directory`);
    // }
    // console.log(config);
    /**
     * Screenshot generation
     */
    const browser = await puppeteer_1.default.launch({
        headless: false,
        args: [`--window-size=800,600`, '--use-gl=desktop'],
        defaultViewport: {
            width: 800,
            height: 600
        }
    });
    console.log('config  ', demo_snippets_1.configs);
    for (let i = 0; i < demo_snippets_1.configs.length; i++) {
        const page = await browser.newPage();
        await page.goto(`file:${path.join(__dirname, 'index.html')}`);
        await page.evaluate(async (config) => {
            const canvas = document.getElementById("output");
            // Create API
            const api = NovoRender.createAPI();
            // Create a view
            const view = await api.createView(config.renderSettings, canvas);
            // load a predefined scene into the view, available views are cube, oilrig, condos
            // let s: WellKnownSceneUrls;
            // switch () {
            //     case 'condos':
            //         s = WellKnownSceneUrls.condos
            //         break;
            //     case 'oilrig':
            //         s = WellKnownSceneUrls.oilrig
            //         break;
            //     case 'cube':
            //         s = WellKnownSceneUrls.cube
            //         break;
            //     default:
            //         s = WellKnownSceneUrls.empty
            //         break;
            // }
            view.scene = await api.loadScene(config.scene);
            console.log('center ', view.scene.boundingSphere.center);
            // provide a controller, available controller types are static, orbit, flight and turntable
            view.camera.controller = api.createCameraController({ kind: "static" }, canvas);
            const ctx = canvas.getContext("bitmaprenderer");
            for (;;) { // render-loop https://dens.website/tutorials/webgl/render-loop
                console.log('Render-loop');
                // const { clientWidth: width, clientHeight: height } = canvas;
                // view.applySettings(config)
                // handle resizes
                const output = await view.render();
                {
                    const image = await output.getImage();
                    if (image) {
                        // display in canvas
                        ctx?.transferFromImageBitmap(image);
                    }
                }
                output.dispose();
                console.log('output.statistics ', output.statistics);
                // break the loop once the scene is fully rendered
                if (output.statistics.renderResolved && output.statistics.sceneResolved) {
                    break;
                }
            }
        }, JSON.parse(JSON.stringify(demo_snippets_1.configs[i]))); // pass the config to browser-context
        console.log('Taking Screenshot for ', demo_snippets_1.configs[i]);
        // save the screenshot to the static/assets
        await page.screenshot({ path: `static/assets/demo-screenshots/${demo_snippets_1.configs[i].demoName}.jpg` });
        console.log('Screenshot taken, closing this page now');
        page.close();
    }
    console.log('Browser Close');
    await browser.close();
    console.log('END!');
})();
