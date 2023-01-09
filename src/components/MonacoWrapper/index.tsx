import React, { Fragment, useEffect, useRef, useState } from 'react';
import Editor, { Monaco, useMonaco } from "@monaco-editor/react";
import Admonition from '@theme/Admonition';
import BrowserOnly from '@docusaurus/BrowserOnly';
import { useColorMode } from '@docusaurus/theme-common';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { Allotment } from "allotment";
import { Popover } from 'react-tiny-popover';
import stringify from "json-stringify-pretty-compact";
import ManagedRenderer from '@site/src/components/RendererManaged';
import Renderer from '@site/src/components/Renderer';
import Spinner from '@site/src/components/misc/spinner';
import { WellKnownSceneUrls } from '@site/src/shared';
import type { API, CameraControllerParams, EnvironmentDescription, RenderSettingsParams } from '@novorender/webgl-api';
import * as ts from "typescript";

/** CSS */
import styles from './styles.module.css';
import "allotment/dist/style.css";
/** CSS END */

/** Icons */
import EditIconSvg from '@site/static/img/pen-to-square-solid.svg';
import CopyIconSvg from '@site/static/img/copy-solid.svg';
import DownloadIconSvg from '@site/static/img/download-solid.svg';
import RotationIconSvg from '@site/static/img/landscape-portrait.svg';
import ExpandIconSvg from '@site/static/img/expand.svg';
import SettingsIconSvg from '@site/static/img/settings.svg';
import AlertsIconSvg from '@site/static/img/alert-circle-outline.svg';
import CameraControllerIconSvg from '@site/static/img/camera-solid.svg';
import SceneIconSvg from '@site/static/img/mountain-solid.svg';
import EnvironmentIconSvg from '@site/static/img/image-solid.svg';
/** Icons END */

import WebglDTS from '!!raw-loader!@site/node_modules/@novorender/webgl-api/index.d.ts';
import DataJsApiDTS from '!!raw-loader!@site/node_modules/@novorender/data-js-api/index.d.ts';
import MeasureApiDTS from '!!raw-loader!@site/node_modules/@novorender/measure-api/index.d.ts';
import GlMatrixDTS from '!!raw-loader!@site/node_modules/gl-matrix/index.d.ts';
import { PlaygroundConfig, predefined_scenes } from '../PlaygroundComponent';
import { cameraTypes, ICameraTypes } from './camera_controllers_config';
import * as MeasureAPI from '@novorender/measure-api';
import * as DataJsAPI from '@novorender/data-js-api';
import * as GlMatrix from 'gl-matrix';

export interface IParams {
    webglAPI: API;
    measureAPI: typeof MeasureAPI;
    dataJsAPI: typeof DataJsAPI;
    primaryCanvas: HTMLCanvasElement;
    glMatrix: typeof GlMatrix;
    canvas2D: HTMLCanvasElement;
};

// the namespace from the original index.d.ts needs replacing
// or Monaco doesn't like it
const dts_fixed = WebglDTS.replace(`"@novorender/webgl-api"`, "NovoRender");
// const dts_fixed_measure_api = MeasureApiDTS.replace(`"@novorender/measure-api"`, "NovoRender1")

interface props {
    code?: string; // code to run in the editor, only required if `renderSettings` is not provided.
    snippet?: string;
    renderSettings?: RenderSettingsParams; // renderSettings for the view, only required if `code` is not provided
    scene?: WellKnownSceneUrls; // default scene to select, only required if `renderSettings` is provided
    demoName: string; // a name for this demo
    editUrl?: string; // relative path to the file that contains the demo code snippet, e.g. `demo-snippets/tutorials/some-snippet.ts`
    playgroundConfig: PlaygroundConfig; // editor/playground internal config
    cameraController?: CameraControllerParams; // default camera controller to select, optionally required if `renderSettings` is provided.
};

function getEnumKeyByValue(value: WellKnownSceneUrls): keyof typeof WellKnownSceneUrls {
    const indexOfKey = Object.values(WellKnownSceneUrls).indexOf(value as unknown as WellKnownSceneUrls);

    const key = Object.keys(WellKnownSceneUrls)[indexOfKey];

    return key as keyof typeof WellKnownSceneUrls;
};

/**
 * @todo move to separate file
 */
function useDebounce<T>(value: T, delay?: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedValue(value), delay || 500);

        return () => {
            clearTimeout(timer);
        };
    }, [value, delay]);

    return debouncedValue;
}

export default function MonacoWrapper({ code, snippet, renderSettings, scene, demoName, cameraController, playgroundConfig, editUrl }: props): JSX.Element {

    const monaco = useMonaco();
    const { siteConfig } = useDocusaurusContext();
    const { colorMode } = useColorMode();
    const editorInstance = useRef(null);
    const textAreaInstance = useRef<HTMLTextAreaElement>(null);
    const editorNavbarInstance = useRef<HTMLTextAreaElement>(null);
    const [renderConfig, setRenderConfig] = useState<RenderSettingsParams>(null);
    const render_config = useDebounce<RenderSettingsParams>(renderConfig, 800);
    const [codeOutput, setCodeOutput] = useState<string>(null);
    const [codeError, setCodeError] = useState(null);
    const [initialCode, setInitialCode] = useState<string>(null);
    const [tsCodeForClipboard, setTsCodeForClipboard] = useState<string>(initialCode);
    const [theme, setTheme] = useState<'light' | 'vs-dark' | ''>('');
    const [currentScene, setCurrentScene] = useState<keyof typeof WellKnownSceneUrls>();
    const [currentCameraController, setCurrentCameraController] = useState<CameraControllerParams | ICameraTypes>(cameraController);
    const [environmentsList, setEnvironmentsList] = useState<EnvironmentDescription[]>([]);
    const [currentEnv, setCurrentEnv] = useState<EnvironmentDescription>();
    const [isActivity, setIsActivity] = useState<boolean>(false);
    const [canvasRef, setCanvasRef] = useState<HTMLCanvasElement>(null);
    const [apiVersion, setApiVersion] = useState<string>(null);
    const [api, setApiInstance] = useState<any>(); // Create API
    const [measureApiInstance, setMeasureApiInstance] = useState<any>(); // Measure API
    const [splitPaneDirectionVertical, setSplitPaneDirectionVertical] = useState<boolean>(true); // Direction to split. If true then the panes will be stacked vertically, otherwise they will be stacked horizontally.
    const [force_rerender_allotment, set_force_rerender_allotment] = useState<boolean>(true); // allotment doesn't support dynamically changing pane positions so we must force re-render the component so it recalculates the size
    const [editorHeight, setEditorHeight] = useState<number>(playgroundConfig.mode === 'inline' ? 300 : (innerHeight / 2) - 68); // minus editor top-bar and footer height
    const [rendererHeight, setRendererHeight] = useState<number>(playgroundConfig.mode === 'inline' ? 200 : (innerHeight / 2) - 68);  // minus editor top-bar and footer height
    const [rendererPaneWidth, setRendererPaneWidth] = useState<number>();
    const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false);
    const [messagesAndAlerts, setMessagesAndAlerts] = useState<string[]>([]);
    const [main, setMain] = useState<any>();
    const [transpiledSnippet, setTranspiledSnippet] = useState<any>();
    const main_debounced = useDebounce(codeOutput, 1000);

    useEffect(() => {

        console.log('playgroundConfig ', playgroundConfig);

        if (code || renderSettings) {
            if (renderSettings) {
                setInitialCode(
                    `export const config: NovoRender.RenderSettingsParams = ${stringify(renderSettings, { indent: 8 })};`
                );
            } else {
                setInitialCode(code);
            }
        }
    }, [code, renderSettings]);

    /**
     * @description transpile and return js string
     * @param editor Editor instance
     * @param monaco Monaco Instance
     * @returns transpiled output as string
     */
    const returnTranspiledOutput = async (editor, monaco: Monaco): Promise<string> => {

        try {
            const model = editor.getModel()!;
            const uri = model.uri;
            const worker = await monaco.languages.typescript.getTypeScriptWorker();
            const languageService = await worker(uri);
            const result = await languageService.getEmitOutput(uri.toString());
            return result.outputFiles[0].text;
        } catch (error) {
            console.log('Failed to get transpiled output, details ==> ', error);
        }
    };

    /**
     * @description extract and return render config
     * @param transpiledOutput string that contains config
     * @returns RenderConfig
     */
    const returnRenderConfigFromOutput = async (transpiledOutput: string): Promise<{ config: RenderSettingsParams, cameraConfig: CameraControllerParams, main: any; init: any; }> => {
        
        const encodedJs = encodeURIComponent(transpiledOutput);
        const dataUri = `data:text/javascript;charset=utf-8,${encodedJs}`;
        const { config, cameraConfig, main, init } = await import(/* webpackIgnore: true */dataUri);

        console.log('main ==> ', main);
        console.log('init ==> ', init);


        return { config, cameraConfig, main, init };
    };

    const codeChangeHandler = async (tsCode: string) => {

        setIsActivity(true); // toggle spinner.
        setTsCodeForClipboard(tsCode); // for clipboard copy
        const output = await returnTranspiledOutput(editorInstance.current, monaco);

        console.log('output ', output);

        // compare current output with previous output to check if anything has 
        // been changed.
        if (codeOutput && JSON.stringify(codeOutput) === JSON.stringify(output)) {
            console.log('[INFO]: Code hasn\'t been changed, returning.');
            setIsActivity(false); // toggle spinner.
            return false;
        }

        // set current output in state so we can compare later
        setCodeOutput(output);

    };

    useEffect(() => {
        if (main_debounced) {
            (async () => {
                const { config, cameraConfig, main, init } = await returnRenderConfigFromOutput(codeOutput);
                if (main) {
                    // first reset `main` so the react forces
                    // the component to remount which then creates
                    // everything again (the view, scene etc...)
                    setMain(() => null);

                    // set the main again
                    setMain(() => init);
                }
                // set render config for output
                setRenderConfig(config);
                if (cameraConfig) { setCurrentCameraController(cameraConfig); };
                setIsActivity(false); // toggle spinner.
            })();
        }
    }, [main_debounced]);


    useEffect(() => {
        // set initial value of current scene.
        setCurrentScene(getEnumKeyByValue(scene));

        (async () => {
            // import dynamically for SSR
            const api = await import('@novorender/webgl-api');
            const measureApi = await import('@novorender/measure-api');

            let result = ts.transpileModule(snippet, { compilerOptions: { module: ts.ModuleKind.ES2015 } });

            const dataUri = `data:text/javascript;charset=utf-8,${result.outputText}`;
            const { main } = await import(/* webpackIgnore: true */dataUri);
    
            console.log('main ==> ', main);

            setTranspiledSnippet(()=> main);

            setApiInstance(api);
            setMeasureApiInstance(measureApi);


            const apiInstance = api.createAPI();

            if (!apiInstance['supportsOffscreenCanvas']) {
                setMessagesAndAlerts([...messagesAndAlerts, '⚠ OffscreenCanvas is not supported in this browser.']);
            }
            setApiVersion(apiInstance.version);

            const envs = await apiInstance.availableEnvironments("https://api.novorender.com/assets/env/index.json");
            setEnvironmentsList(envs as EnvironmentDescription[]);
        })();

    }, []);

    // handle editor theme based on docusaurus colorMode.
    useEffect(() => {
        setTheme(colorMode === 'dark' ? 'vs-dark' : 'light');
    }, [colorMode]);

    useEffect(() => {
        if (monaco) {
            // Add additional d.ts files to the JavaScript language service and change.
            // Also change the default compilation options.
            // The sample below shows how a class Facts is declared and introduced
            // to the system and how the compiler is told to use ES6 (target=2).

            // validation settings
            // monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
            //   noSemanticValidation: true,
            //   noSyntaxValidation: false
            // });

            // compiler options
            //   monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
            // //     moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
            //     allowSyntheticDefaultImports: true
            //   });

            const libUri = "index.d.ts";
            monaco.languages.typescript.typescriptDefaults.addExtraLib(
                WebglDTS + dts_fixed + MeasureApiDTS + GlMatrixDTS + DataJsApiDTS,
                libUri
            );

            // monaco.languages.typescript.typescriptDefaults.addExtraLib(
            //    GlMatrixDTS,
            //     'file:///node_modules/gl-matrix/index.d.ts'
            // );

            // When resolving definitions and references, the editor will try to use created models.
            // Creating a model for the library allows "peek definition/references" commands to work with the library.
            if (!monaco.editor.getModel(monaco.Uri.parse(libUri))) {
                monaco.editor.createModel(
                    WebglDTS + dts_fixed + MeasureApiDTS + GlMatrixDTS + DataJsApiDTS,
                    "typescript",
                    monaco.Uri.parse(libUri)
                );
            }

        }
    }, [monaco]);

    async function handleEditorDidMount(editor, monaco: Monaco) {
        setIsActivity(true); // toggle spinner
        editorInstance.current = editor;
        await editor.getAction('editor.action.formatDocument').run();
        editor.setPosition({ column: 1, lineNumber: 15 });
        editor.revealLineInCenter(20);
        const output = await returnTranspiledOutput(editor, monaco);
        setCodeOutput(output);
        const { config, main, init } = await returnRenderConfigFromOutput(output);

        setRenderConfig(config);

        if (init) {
            setMain(() => init);
        }

        setIsActivity(false); // toggle spinner
    }

    function handleEditorValidation(markers) {
        console.log('markers ', markers);

        if (markers.length && markers[0].severity > 1) {
            console.log('diags ', markers[0]);
            const diagnostic = markers[0];
            setCodeError(diagnostic);
        } else {
            setCodeError(null);
        }
    }

    // copy the current code output to clipboard
    function copyToClipboard() {
        textAreaInstance.current.select();
        document.execCommand('copy');
    };

    // download the contents of current canvas as image
    function downloadCanvasAsImage(): void {
        let link = document.createElement('a');
        link.download = `${demoName}.png`;
        link.href = canvasRef.toDataURL();
        link.click();
        link.remove();
    }

    // change split pane mode to vertical or horizontal
    function changeSplitPaneRotation(): void {
        set_force_rerender_allotment(false); // hide the allotment component
        setSplitPaneDirectionVertical(!splitPaneDirectionVertical); // update position
        setTimeout(() => {
            set_force_rerender_allotment(true); // render the allotment component again
        }, 50);
    };

    // toggle canvas fullscreen mode
    function toggleCanvasFullscreenMode(): void {
        canvasRef.requestFullscreen()
            .catch(e => {
                console.log('Failed to request fullscreen => ', e);
                alert('Failed to expand canvas');
            });
    }

    /**
     * @description handle the camera controller change
     * @param cameraType 
     * @param isConfiguringInEditor 
     */
    function configureCameraController(cameraType: ICameraTypes, isConfiguringInEditor: boolean): void {

        let editorValue: string = editorInstance.current.getModel().getValue();

        const regex = /(export\s*const\s*cameraConfig(.*?){(.*?)};)/gs; // regex to match camera controller config object.
        const isMatch = regex.test(editorValue);
        const newCameraConfig = `\nexport const cameraConfig ${cameraType.configObject};`;

        if (isMatch) { // there's already a config object in the editor

            if (isConfiguringInEditor) { // is camera configuration being done manually in the editor
                editorValue = editorValue.replace(regex, newCameraConfig);
            } else {
                editorValue = editorValue.replace(regex, '');
                setCurrentCameraController(cameraType);
            }

            setInitialCode(editorValue);

        } else {

            if (isConfiguringInEditor) { // is camera configuration being done manually in the editor
                const lineCount = editorInstance.current.getModel().getLineCount();
                var range = new monaco.Range(lineCount + 1, 1, lineCount + 1, 1);
                var id = { major: 1, minor: 1 };
                const text = `\n${newCameraConfig}`;
                var op = { identifier: id, range, text, forceMoveMarkers: true };
                editorInstance.current.executeEdits("edit1", [op]);
            } else {
                setCurrentCameraController(cameraType);
            }

        }

    };

    return (
        <BrowserOnly>
            {
                () => <Fragment>
                    <nav className="navbar playground_navbar" style={{ paddingTop: 0, paddingBottom: 0, height: 36, marginBottom: 5 }}>
                        <div className="navbar__inner">
                            <div className="navbar__items">
                                {demoName}
                                {isActivity && <Spinner />}
                            </div>

                            {renderSettings && <div className="navbar__items navbar__items--right">

                                {/* Camera controller type drop-down */}
                                <div className="navbar__item dropdown dropdown--hoverable">
                                    <button className={`button button--sm button--primary ${styles.controllerButton}`}>
                                        <CameraControllerIconSvg className={styles.controllersIcon} /> {currentCameraController?.kind}
                                    </button>
                                    <ul className="dropdown__menu">
                                        {
                                            cameraTypes.map((c, i) => (
                                                <li key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <a className={`dropdown__link ${currentCameraController.kind === c.kind && styles.controllerDropDownActive}`} style={{ flex: 1 }} onClick={(e) => { e.preventDefault(); configureCameraController(c, false); }} href="#">{c.kind}</a>
                                                    <button onClick={() => { configureCameraController(c, true); }} className='clean-btn' style={{ padding: '0 6px' }} title='Configure camera controller via editor'>
                                                        <SettingsIconSvg className={styles.editorSvgIcon} />
                                                    </button>
                                                </li>
                                            ))
                                        }
                                    </ul>
                                </div>

                                {/* Scene drop-down */}
                                <div className="navbar__item dropdown dropdown--hoverable">
                                    <button className={`button button--sm button--primary ${styles.controllerButton}`}>
                                        <SceneIconSvg /> {currentScene}
                                    </button>
                                    <ul className="dropdown__menu">
                                        {
                                            predefined_scenes.map((s, i) => (
                                                <li key={i}>
                                                    <a className={`dropdown__link ${currentScene === s && styles.controllerDropDownActive}`} onClick={(e) => { e.preventDefault(); setCurrentScene(s); }} href="#">{s}</a>
                                                </li>
                                            ))
                                        }
                                    </ul>
                                </div>

                                {/* Env drop-down */}
                                <div className="navbar__item dropdown dropdown--hoverable">
                                    <button className={`button button--sm button--primary ${styles.controllerButton}`}>
                                        <EnvironmentIconSvg /> {currentEnv?.name || 'None'}
                                    </button>
                                    <ul className={`dropdown__menu ${styles.envDropdown}`}>
                                        <li><a className="dropdown__link" onClick={(e) => { e.preventDefault(); setCurrentEnv(undefined); }} href="#">None</a></li>
                                        {
                                            environmentsList.map((env, i) => (
                                                <li key={i}>
                                                    <img src={env.thumnbnailURL} />
                                                    <a className={`dropdown__link ${currentEnv?.name === env.name && styles.controllerDropDownActive}`} onClick={(e) => { e.preventDefault(); setCurrentEnv(env); }} href="#">{env.name}</a>
                                                </li>
                                            ))
                                        }
                                    </ul>
                                </div>
                            </div>}
                        </div>
                    </nav>

                    <div style={{ height: Boolean(editorHeight) && Boolean(rendererHeight) && (editorHeight + rendererHeight) }}>
                        {force_rerender_allotment && <Allotment onChange={(e: Array<number>) => {
                            if (e?.length > 1) {
                                if (splitPaneDirectionVertical) {
                                    setEditorHeight(e[0]);
                                    setRendererHeight(e[1]);
                                } else {
                                    setRendererPaneWidth(e[1]);
                                }
                            }
                        }}
                            vertical={splitPaneDirectionVertical}>

                            <div style={{ position: 'relative' }}>
                                <Editor
                                    height={splitPaneDirectionVertical ? editorHeight : editorHeight + rendererHeight}
                                    defaultLanguage="typescript"
                                    value={initialCode}
                                    onChange={codeChangeHandler}
                                    loading="loading the playground"
                                    theme={theme}
                                    options={{
                                        minimap: { enabled: false },
                                        formatOnPaste: true,
                                        formatOnType: true,
                                        scrollBeyondLastLine: false,
                                        automaticLayout: true,
                                        contextmenu: false,
                                        folding: true,
                                        showFoldingControls: "always",
                                        guides: { indentation: true },
                                    }}
                                    onMount={handleEditorDidMount}
                                    onValidate={handleEditorValidation}
                                />
                                {codeError && <div style={{ position: 'absolute', bottom: 0, right: 30, maxWidth: '600px' }}>
                                    <Admonition type="danger" title={`error on line: ${codeError.endLineNumber}, column: ${codeError.endColumn}`}>
                                        <p>{codeError.message}</p>
                                    </Admonition>
                                </div>}
                            </div>
                            {render_config || main
                                ? <>{renderSettings
                                    ? <ManagedRenderer api={api} config={render_config} scene={WellKnownSceneUrls[currentScene]} environment={currentEnv} cameraController={currentCameraController} isDoingActivity={setIsActivity} canvasRef={setCanvasRef} panesHeight={splitPaneDirectionVertical ? rendererHeight : editorHeight + rendererHeight} panesWidth={rendererPaneWidth} onMessagesAndAlert={(m) => setMessagesAndAlerts(Array.from(new Set([...messagesAndAlerts, m])))} />
                                    : <Renderer api={api} measureApiInstance={measureApiInstance} main={main} snippet={transpiledSnippet} isDoingActivity={setIsActivity} canvasRef={setCanvasRef} panesHeight={splitPaneDirectionVertical ? rendererHeight : editorHeight + rendererHeight} panesWidth={rendererPaneWidth} playgroundConfig={playgroundConfig} onMessagesAndAlert={(m) => setMessagesAndAlerts(Array.from(new Set([...messagesAndAlerts, m])))} />}</>
                                : <div style={{ height: splitPaneDirectionVertical ? rendererHeight : editorHeight + rendererHeight, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Loading the renderer...</div>
                            }
                        </Allotment>}
                    </div>
                    <textarea
                        ref={textAreaInstance}
                        defaultValue={tsCodeForClipboard}
                        style={{ position: 'absolute', width: 0, height: 0, top: 5 }}
                    />

                    <nav className="navbar playground_navbar" ref={editorNavbarInstance} style={{ paddingTop: 0, paddingBottom: 0, height: 26, marginTop: 5 }}>
                        <div className="navbar__inner">
                            <div className="navbar__items">
                                <p style={{ color: 'var(--ifm-color-gray-800)', fontSize: 12, margin: 0 }}>API Version: {apiVersion}</p>

                                {/* Messages/alert popover */}
                                <Popover
                                    isOpen={isPopoverOpen}
                                    positions={['top', 'right', 'bottom', 'left']}
                                    parentElement={playgroundConfig.mode === 'inline' ? editorNavbarInstance.current : undefined}
                                    content={<div className={styles.popoverContent}><ol>{messagesAndAlerts?.length ? messagesAndAlerts.map((m, i) => <li key={i}>{m}</li>) : <li>No messages or warnings at the moment.</li>}</ol></div>}
                                >
                                    <button onMouseEnter={() => { setIsPopoverOpen(true); }} onMouseLeave={() => { setIsPopoverOpen(false); }} className='clean-btn navbar__item' title='messages and alerts' style={{ marginTop: '-2px' }}>
                                        <AlertsIconSvg className={styles.editorSvgIcon} style={messagesAndAlerts.length ? { color: 'var(--ifm-color-warning-darkest)', fill: 'var(--ifm-color-warning-darkest)' } : { color: 'var(--ifm-color-gray-800)', fill: 'var(--ifm-color-gray-800)' }} />
                                    </button>
                                </Popover>
                            </div>

                            <div className="navbar__items navbar__items--right">
                                {/* expand canvas to fullscreen */}
                                <button onClick={toggleCanvasFullscreenMode} className='clean-btn navbar__item' title='Expand the canvas to fullscreen' style={{ marginTop: '-2px' }}>
                                    <ExpandIconSvg className={styles.editorSvgIcon} />
                                </button>

                                {/* Pane mode change */}
                                <button onClick={changeSplitPaneRotation} className='clean-btn navbar__item' title='Change split pane mode' style={{ marginTop: '-2px' }}>
                                    <RotationIconSvg className={styles.editorSvgIcon} />
                                </button>

                                {/* Download image */}
                                <button onClick={downloadCanvasAsImage} disabled={!canvasRef} className='clean-btn navbar__item' title='Download current view as image' style={{ marginTop: '-2px' }}>
                                    <DownloadIconSvg className={styles.editorSvgIcon} />
                                </button>

                                {/* Copy snippet */}
                                <button onClick={copyToClipboard} className='clean-btn navbar__item' title='Copy TypeScript code to clipboard' style={{ marginTop: '-2px' }}>
                                    <CopyIconSvg className={styles.editorSvgIcon} />
                                </button>

                                {/* Edit snippet */}
                                <a href={`${siteConfig.presets[0][1]['docs'].editUrl}${editUrl ? '/' + editUrl : '/demo-snippets/' + demoName + '/render-settings.ts'}`} className="navbar__item" title='Edit this code snippet on Github' style={{ marginTop: '-2px' }} target="_blank"><EditIconSvg className={styles.editorSvgIcon} /></a>
                            </div>
                        </div>
                    </nav>
                </Fragment>
            }
        </BrowserOnly>
    );
}
