import React, { Fragment, useEffect, useRef, useState } from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import { useColorMode } from '@docusaurus/theme-common';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Admonition from '@theme/Admonition';
import Editor, { Monaco, useMonaco } from "@monaco-editor/react";
import { Allotment } from "allotment";
import { Popover } from 'react-tiny-popover';
import Renderer from '@site/src/components/Renderer';
import Spinner from '@site/src/components/misc/spinner';
const { devDependencies } = require('../../../package.json');

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
import AlertsIconSvg from '@site/static/img/alert-circle-outline.svg';
/** Icons END */

// @ts-expect-error
import WebglDTS from '!!raw-loader!@site/node_modules/@novorender/webgl-api/index.d.ts';
// @ts-expect-error
import DataJsApiDTS from '!!raw-loader!@site/node_modules/@novorender/data-js-api/index.d.ts';
// @ts-expect-error
import MeasureApiDTS from '!!raw-loader!@site/node_modules/@novorender/measure-api/index.d.ts';
// @ts-expect-error
import GlMatrixDTS from '!!raw-loader!@site/node_modules/gl-matrix/index.d.ts';
import * as MeasureAPI from '@novorender/measure-api';
import * as DataJsAPI from '@novorender/data-js-api';
import * as GlMatrix from 'gl-matrix';

/** Types */
import type { API } from '@novorender/webgl-api';
import type { IDempProps } from "@site/demo-snippets/misc";
/** Types END */

export interface IParams {
    webglAPI: API;
    measureAPI: typeof MeasureAPI;
    dataJsAPI: typeof DataJsAPI;
    glMatrix: typeof GlMatrix;
    primaryCanvas: HTMLCanvasElement;
    canvas2D: HTMLCanvasElement;
};

// the namespace from the original index.d.ts needs replacing
// or Monaco doesn't like it
const dts_fixed = WebglDTS.replace(`"@novorender/webgl-api"`, "NovoRender");
// const dts_fixed_measure_api = MeasureApiDTS.replace(`"@novorender/measure-api"`, "NovoRender1")


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

export default function MonacoWrapper({ code, demoName, description, editorConfig, editUrl }: IDempProps): JSX.Element {

    const monaco = useMonaco();
    const { siteConfig } = useDocusaurusContext();
    const { colorMode } = useColorMode();
    const editorInstance = useRef(null);
    const textAreaInstance = useRef<HTMLTextAreaElement>(null);
    const editorFooterInstance = useRef<HTMLElement>(null);
    const editorNavbarInstance = useRef<HTMLElement>(null);
    const [codeOutput, setCodeOutput] = useState<string>(null);
    const [codeError, setCodeError] = useState(null);
    const [initialCode, setInitialCode] = useState<string>(null);
    const [tsCodeForClipboard, setTsCodeForClipboard] = useState<string>(initialCode);
    const [theme, setTheme] = useState<'light' | 'vs-dark' | ''>('');
    const [isActivity, setIsActivity] = useState<boolean>(false);
    const [canvasRef, setCanvasRef] = useState<HTMLCanvasElement>(null);
    const [canvasWrapperRef, setCanvasWrapperRef] = useState<HTMLDivElement>(null);
    const [api, setApiInstance] = useState<any>(); // Create API
    const [measureApiInstance, setMeasureApiInstance] = useState<any>(); // Measure API
    const [splitPaneDirectionVertical, setSplitPaneDirectionVertical] = useState<boolean>(true); // Direction to split. If true then the panes will be stacked vertically, otherwise they will be stacked horizontally.
    const [force_rerender_allotment, set_force_rerender_allotment] = useState<boolean>(true); // allotment doesn't support dynamically changing pane positions so we must force re-render the component so it recalculates the size
    const [editorHeight, setEditorHeight] = useState<number>(editorConfig.mode === 'inline' ? (((innerHeight * 80) / 100) / 2) : (innerHeight / 2) - 68); // minus editor top-bar and footer height
    const [rendererHeight, setRendererHeight] = useState<number>(editorConfig.mode === 'inline' ? (((innerHeight * 80) / 100) / 2) : (innerHeight / 2) - 68);  // minus editor top-bar and footer height
    const [rendererPaneWidth, setRendererPaneWidth] = useState<number>();
    const [isDemoDescPopoverOpen, setIsDemoDescPopoverOpen] = useState<boolean>(false);
    const [isMessagesAndAlertPopoverOpen, setIsMessagesAndAlertPopoverOpen] = useState<boolean>(false);
    const [messagesAndAlerts, setMessagesAndAlerts] = useState<string[]>([]);
    const [main, setMain] = useState<any>();
    const main_debounced = useDebounce(codeOutput, 1000);

    useEffect(() => {

        console.log('playgroundConfig ', editorConfig);

        if (code) {
            setInitialCode(code);
            setTsCodeForClipboard(code); // for clipboard copy
        }
    }, [code]);

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
    const returnRenderConfigFromOutput = async (transpiledOutput: string): Promise<{ main: any; }> => {
        const encodedJs = encodeURIComponent(transpiledOutput);
        const dataUri = `data:text/javascript;charset=utf-8,${encodedJs}`;
        const { main } = await import(/* webpackIgnore: true */dataUri);

        console.log('main ==> ', main);

        return { main };
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
                const { main } = await returnRenderConfigFromOutput(codeOutput);
                if (main) {
                    // first reset `main` so the react forces
                    // the component to remount which then creates
                    // everything again (the view, scene etc...)
                    setMain(() => null);

                    // set the main again
                    setMain(() => main);
                }
                setIsActivity(false); // toggle spinner.
            })();
        }
    }, [main_debounced]);


    useEffect(() => {

        (async () => {
            // import dynamically for SSR
            const api = await import('@novorender/webgl-api');
            const measureApi = await import('@novorender/measure-api');

            setApiInstance(api);
            setMeasureApiInstance(measureApi);

            const apiInstance = api.createAPI();

            if (!apiInstance['supportsOffscreenCanvas']) {
                setMessagesAndAlerts([...messagesAndAlerts, '⚠ OffscreenCanvas is not supported in this browser.']);
            }

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
            //     // moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
            //     // allowSyntheticDefaultImports: true,
            //     moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
            //     module: monaco.languages.typescript.ModuleKind.ESNext,
            //     allowNonTsExtensions: true,
            //     // baseUrl: '.',
            //     // paths: { "@/*": ['node_modules/*'] },
            //     target: monaco.languages.typescript.ScriptTarget.Latest
            //   });

            const libUri = "index.d.ts";
            monaco.languages.typescript.typescriptDefaults.addExtraLib(
                WebglDTS + dts_fixed + MeasureApiDTS + GlMatrixDTS + DataJsApiDTS,
                libUri
            );

            monaco.languages.typescript.typescriptDefaults.addExtraLib(
                `/**
             * @description opens an alert that displays provided content
             * @param content string to show in the alert
             */
            declare function openAlert(content:string):void
            
            /**
            * @description opens a pane in bottom left of renderer to show any text
            * @param content string to show in the info pane
            */
            declare function openInfoPane(content: string | object | any): void;`);

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
        if (editorConfig.hiddenAreas && editorConfig.hiddenAreas.length) {
            editor.setHiddenAreas(editorConfig.hiddenAreas.map(r => new monaco.Range(r.startLineNumber, 0, r.endLineNumber, 0)));
        }
        await editor.getAction('editor.action.formatDocument').run();
        editor.setPosition(editorConfig.cursorPosition);
        editor.revealLineNearTop(editorConfig.revealLine);
        const output = await returnTranspiledOutput(editor, monaco);
        setCodeOutput(output);
        const { main } = await returnRenderConfigFromOutput(output);

        if (main) {
            setMain(() => main);
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
        canvasWrapperRef.requestFullscreen()
            .catch(e => {
                console.log('Failed to request fullscreen => ', e);
                alert('Failed to expand canvas');
            });
    }


    return (
        <BrowserOnly>
            {
                () => <Fragment>
                    <nav className="navbar playground_navbar" ref={editorNavbarInstance} style={{ paddingTop: 0, paddingBottom: 0, height: 36, marginBottom: 5 }}>
                        <div className="navbar__inner">
                            <div className="navbar__items">
                                {/* Demo description popover */}
                                <Popover
                                    isOpen={isDemoDescPopoverOpen}
                                    positions={['bottom', 'right', 'top', 'left']}
                                    parentElement={editorConfig.mode === 'inline' ? editorNavbarInstance.current : undefined}
                                    content={
                                        <div className={styles.popoverContent}>
                                            <p style={{ color: 'var(--ifm-color-gray-400)', fontSize: 12, margin: 0 }}>{description}</p>
                                        </div>}
                                >
                                    <button onMouseEnter={() => { setIsDemoDescPopoverOpen(true); }} onMouseLeave={() => { setIsDemoDescPopoverOpen(false); }} className='clean-btn navbar__item' title='Description for this demo' style={{ marginTop: 4 }}>
                                        <AlertsIconSvg className={styles.editorSvgIcon} style={{ color: 'var(--ifm-color-secondary-darkest)', fill: 'var(--ifm-color-secondary-darkest)' }} />
                                    </button>
                                </Popover>
                                {demoName}
                                {isActivity && <Spinner />}
                            </div>
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
                                        folding: false,
                                        showFoldingControls: "never",
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
                            {main
                                ? <Renderer canvasWrapperRef={setCanvasWrapperRef} api={api} measureApiInstance={measureApiInstance} main={main} isDoingActivity={setIsActivity} canvasRef={setCanvasRef} panesHeight={splitPaneDirectionVertical ? rendererHeight : editorHeight + rendererHeight} panesWidth={rendererPaneWidth} editorConfig={editorConfig} onMessagesAndAlert={(m) => setMessagesAndAlerts(Array.from(new Set([...messagesAndAlerts, m])))} />
                                : <div style={{ height: splitPaneDirectionVertical ? rendererHeight : editorHeight + rendererHeight, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Loading the renderer...</div>
                            }
                        </Allotment>}
                    </div>
                    <textarea ref={textAreaInstance} defaultValue={tsCodeForClipboard} style={{ position: 'absolute', width: 0, height: 0, top: 5 }} />

                    <nav className="navbar playground_navbar" ref={editorFooterInstance} style={{ paddingTop: 0, paddingBottom: 0, height: 26, marginTop: 5 }}>
                        <div className="navbar__inner">
                            <div className="navbar__items">
                                {/* Messages/alert popover */}
                                <Popover
                                    isOpen={isMessagesAndAlertPopoverOpen}
                                    positions={['top', 'right', 'bottom', 'left']}
                                    parentElement={editorConfig.mode === 'inline' ? editorFooterInstance.current : undefined}
                                    content={
                                        <div className={styles.popoverContent}>
                                            <p style={{ color: 'var(--ifm-color-gray-800)', fontSize: 12, margin: 0 }}>WebGL API: {devDependencies['@novorender/webgl-api']}</p>
                                            <p style={{ color: 'var(--ifm-color-gray-800)', fontSize: 12, margin: 0 }}>Data JS API: {devDependencies['@novorender/data-js-api']}</p>
                                            <p style={{ color: 'var(--ifm-color-gray-800)', fontSize: 12, margin: 0 }}>Measure API: {devDependencies['@novorender/measure-api']}</p>
                                            <hr style={{ margin: '5px 0' }} />
                                            <ol>{messagesAndAlerts?.length ? messagesAndAlerts.map((m, i) => <li key={i}>{m}</li>) : <li>No messages or warnings at the moment.</li>}</ol>
                                        </div>}
                                >
                                    <button onMouseEnter={() => { setIsMessagesAndAlertPopoverOpen(true); }} onMouseLeave={() => { setIsMessagesAndAlertPopoverOpen(false); }} className='clean-btn navbar__item' title='messages and alerts' style={{ marginTop: '-2px', marginLeft: '-12px' }}>
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
