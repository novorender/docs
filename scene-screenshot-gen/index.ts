import puppeteer from 'puppeteer'
import * as path from 'path';
const { configPath } = require('yargs').argv;
import { RenderSettingsParams, WellKnownSceneUrls } from '@novorender/webgl-api';
declare const NovoRender: typeof import("@novorender/webgl-api");

import { configs } from '../demo-snippets';

/**
 * use https://marketplace.visualstudio.com/items?itemName=marcoq.vscode-typescript-to-json-schema
 * to define schema for the config file from this interface.
 */
interface IConfig {
    "renderSettings": RenderSettingsParams
}

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
    const browser = await puppeteer.launch({
        headless: false,
        args: [`--window-size=800,600`, '--use-gl=desktop'],
        defaultViewport: {
            width: 800,
            height: 600
        }
    });

    console.log('config  ', configs);

    for (let i = 0; i < configs.length; i++) {

        const page = await browser.newPage();
        await page.goto(`file:${path.join(__dirname, 'index.html')}`);
        await page.evaluate(async (config) => {

            const canvas = <HTMLCanvasElement>document.getElementById("output");

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
            view.camera.controller = api.createCameraController(<any>{ kind: "static" }, canvas);

            const ctx = canvas.getContext("bitmaprenderer");
            for (; ;) { // render-loop https://dens.website/tutorials/webgl/render-loop
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
                (<any>output).dispose();

                console.log('output.statistics ', output.statistics);

                // break the loop once the scene is fully rendered
                if (output.statistics.renderResolved && output.statistics.sceneResolved) {
                    break;
                }
            }
        }, JSON.parse(JSON.stringify(configs[i]))); // pass the config to browser-context

        console.log('Taking Screenshot for ', configs[i]);

        // save the screenshot to the static/assets
        await page.screenshot({ path: `static/assets/demo-screenshots/${configs[i].demoName}.jpg` });

        console.log('Screenshot taken, closing this page now');
        page.close();
    }

    console.log('Browser Close');

    await browser.close();

    console.log('END!');

})();
