import React, { useEffect, useRef, useState } from "react";
import BrowserOnly from "@docusaurus/BrowserOnly";
import type { API, RenderSettingsParams, View, EnvironmentDescription } from "@novorender/webgl-api";
import { WellKnownSceneUrls } from '@site/src/shared';

let isComponentUnmounted = false;

const createView = async (api: API, scene: WellKnownSceneUrls, canvas: HTMLCanvasElement) => {

    try {
        // Create a view
        const view = await api.createView({}, canvas);

        // load a predefined scene into the view, available views are cube, oilrig, condos
        view.scene = await api.loadScene(scene);

        // provide a controller, available controller types are static, orbit, flight and turntable
        view.camera.controller = api.createCameraController({ kind: 'static' } as any, canvas);

        console.log('returning view', view);

        return view;

    } catch (error) {
        console.log('Error caught ', error);
    }
}

const renderLoop = async (canvas: HTMLCanvasElement, view: View) => {

    console.log('canvas, ', canvas);
    console.log('view ', view);
    const ctx = canvas.getContext("bitmaprenderer");
    // start a render loop
    for (; ;) {

        console.log('Render loop');

        if (isComponentUnmounted) { break; } // cleanup

        const { clientWidth: width, clientHeight: height } = canvas;

        try {
            // handle resizes
            view.applySettings({ display: { width, height } });
        } catch (e) {
            console.log('[Render Loop]: couldn\'t applySettings, ', e);
        }

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

export default function Render({ config, scene, environment, demoName, isDoingActivity, canvasRef, apiVersion, api }: { config: RenderSettingsParams, scene: WellKnownSceneUrls, environment: EnvironmentDescription, demoName: string, isDoingActivity: (a: boolean) => void, canvasRef: (a: HTMLCanvasElement) => void, apiVersion: (v: string) => void, api: any }): JSX.Element {

    const canvas = useRef<HTMLCanvasElement>(null);
    const [view, setView] = useState<View>(null);
    const [apiInstance, setApiInstance] = useState<API>(api.createAPI()); // Create API
    // const [isRenderView, setIsRenderView] = useState(false);

    // const renderView = async () => {
    //     // setIsRenderView(true);
    //     if (ExecutionEnvironment.canUseDOM) {
    //         console.log('canvas ', canvas);
    //         try {
    //             isDoingActivity(true); // toggle loader
    //             const _view = await createView(apiInstance, scene, canvas.current);
    //             _view.applySettings(config);
    //             renderLoop(canvas.current, _view);
    //             setView(_view);
    //         } catch (e) {
    //             console.log('Something went wrong while rendering view, ', e);
    //         } finally {
    //             isDoingActivity(false);  // toggle loader
    //             canvasRef(canvas.current);
    //         }
    //     }
    // };

    // dispose view and local state
    const _dispose = (view: View) => {
        (view as any).dispose();
        apiInstance.dispose();
        // setIsRenderView(false);
        setApiInstance(null);
        setView(null);
    }

    useEffect(() => {
        console.log('[Render useEffect]: Init');
        console.log('canvas ', canvas);

        (async () => {
            try {
                isDoingActivity(true); // toggle loader
                const _view = await createView(apiInstance, scene, canvas.current);
                _view.applySettings(config);
                renderLoop(canvas.current, _view);
                setView(_view);
            } catch (e) {
                console.log('Something went wrong while rendering view, ', e);
            } finally {
                isDoingActivity(false);  // toggle loader
                canvasRef(canvas.current);
            }
        })();

        isComponentUnmounted = false;
        apiVersion(apiInstance.version);
        return () => {
            console.log('[Render useEffect]: Cleanup');
            isComponentUnmounted = true;
            if (view) {
                _dispose(view);
            }
        };
    }, []);

    // handle config updates.
    useEffect(() => {
        console.log('[Renderer]: config changed ', config);
        if (!view) {
            console.log('View not found, couldn\'t apply the config ', view);
            return;
        }
        if (config) {
            view.applySettings(config);
        }
    }, [config]);

    // handle scene updates.
    useEffect(() => {
        console.log('[Renderer]: new scene to change ==> ', scene);
        if (!view) {
            console.log('View not found, couldn\'t change the scene ', view);
            return;
        }
        if (scene) {

            console.log('view ', view);

            isDoingActivity(true); // toggle loader
            (async () => {
                try {
                    // need to reset the current env here, else you
                    // get the `detached ArrayBuffer` error from the API
                    view.settings.environment = undefined;
                    view.scene = await apiInstance.loadScene(scene);
                    
                    if (environment) { // re-apply the selected env again
                        view.settings.environment = await apiInstance.loadEnvironment(environment);
                    }
                } catch (e) {
                    console.log('ERROR: Failed to update scene, ', e);
                } finally {
                    isDoingActivity(false); // toggle loader
                }
            })();
        }
    }, [scene]);

    // handle env updates.
    useEffect(() => {
        console.log('[Renderer]: new env to change ==> ', environment);
        if (!view) {
            console.log('View not found, couldn\'t change the environment ', view);
            return;
        }

        if (environment) {
            isDoingActivity(true); // toggle loader

            (async () => {
                try {
                    view.settings.environment = await apiInstance.loadEnvironment(environment);
                    isDoingActivity(false); // toggle loader
                } catch (e) {
                    console.log('ERROR: Failed to update environment, ', e);
                } finally {
                    isDoingActivity(false); // toggle loader
                }

            })();
        } else {
            view.settings.environment = undefined;
        }
    }, [environment]);

    return (
        <BrowserOnly>
            {
                () => <div style={{ height: 300, overflow: 'hidden' }}>
                    <canvas ref={canvas} style={{ width: '100%', height: '100%' }}></canvas>
                </div>
            }
        </BrowserOnly>
    );
}