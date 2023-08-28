import React, { Fragment, useEffect, useRef, useState } from "react";
import BrowserOnly from "@docusaurus/BrowserOnly";
import useBaseUrl from "@docusaurus/useBaseUrl";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Link from "@docusaurus/Link";
import { useColorMode } from "@docusaurus/theme-common";
import { useHistory } from "@docusaurus/router";
import { editor } from "monaco-editor";
import Editor, { Monaco, useMonaco } from "@monaco-editor/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Admonition from "@theme/Admonition";
import { Allotment } from "allotment";
import { Popover } from "react-tiny-popover";
import Renderer from "@site/src/components/Renderer";
import Spinner from "@site/src/components/misc/spinner";
import { IDemoHost, type IDempProps, createDemoContext } from "@site/demo-snippets/demo";
const { devDependencies } = require("../../../package.json");

/** CSS */
import "./index.styles.css";
import "allotment/dist/style.css";
/** CSS END */

/** Icons */
import RotationIconSvg from "@site/static/img/landscape-portrait.svg";
import { faSquareArrowUpRight, faUpRightAndDownLeftFromCenter, faDownload, faCopy, faPenToSquare, faCircleInfo, faGear } from "@fortawesome/free-solid-svg-icons";
/** Icons END */

import WebAppDTS from "@site/static/web_api.d.ts?raw";
import GlMatrixDTS from "@site/node_modules/gl-matrix/index.d.ts?raw";
import DataJsApiDTS from "@site/node_modules/@novorender/data-js-api/index.d.ts?raw";

const editorOptions: editor.IEditorConstructionOptions = {
  minimap: { enabled: false },
  formatOnPaste: true,
  formatOnType: true,
  scrollBeyondLastLine: false,
  automaticLayout: true,
  contextmenu: false,
  folding: false,
  showFoldingControls: "never",
  guides: { indentation: true },
  fixedOverflowWidgets: true,
  lineNumbers: "off",
};

export default function MonacoWrapper({ code, demoName, dirName, fileName, description, editorConfig, editUrl, hostCtor }: IDempProps): JSX.Element {
  const monaco = useMonaco();
  const { siteConfig } = useDocusaurusContext();
  const { colorMode } = useColorMode();
  const themeURL = useBaseUrl("/assets/monaco-theme-oceanic-next.json");
  const history = useHistory();
  const editorInstance = useRef(null);
  const textAreaInstance = useRef<HTMLTextAreaElement>(null);
  const editorFooterInstance = useRef<HTMLElement>();
  const editorNavbarInstance = useRef<HTMLElement>();
  const [codeOutput, setCodeOutput] = useState<string>(null);
  const [codeError, setCodeError] = useState(null);
  const [initialCode, setInitialCode] = useState<string>(null);
  const [tsCodeForClipboard, setTsCodeForClipboard] = useState<string>(initialCode);
  const [theme, setTheme] = useState<"light" | "vs-dark" | "">("");
  const [isActivity, setIsActivity] = useState<boolean>(false);
  const [splitPaneDirectionVertical, setSplitPaneDirectionVertical] = useState<boolean>(true); // Direction to split. If true then the panes will be stacked vertically, otherwise they will be stacked horizontally.
  const [force_rerender_allotment, set_force_rerender_allotment] = useState<boolean>(true); // allotment doesn't support dynamically changing pane positions so we must force re-render the component so it recalculates the size
  const [editorHeight, setEditorHeight] = useState<number>(editorConfig.mode === "inline" ? (innerHeight * 80) / 100 / 2 : innerHeight / 2 - 68); // minus editor top-bar and footer height
  const [rendererHeight, setRendererHeight] = useState<number>(editorConfig.mode === "inline" ? (innerHeight * 80) / 100 / 2 : innerHeight / 2 - 68); // minus editor top-bar and footer height
  const [rendererPaneWidth, setRendererPaneWidth] = useState<number>();
  const [isDemoDescPopoverOpen, setIsDemoDescPopoverOpen] = useState<boolean>(false);
  const [isMessagesAndAlertPopoverOpen, setIsMessagesAndAlertPopoverOpen] = useState<boolean>(false);
  const [messagesAndAlerts, setMessagesAndAlerts] = useState<string[]>([]);
  const [isHiddenAreasShowing, setIsHiddenAreasShowing] = useState<boolean>(false);
  const [hasMainChanged, setHasMainChanged] = useState(false);
  const [fontSize, setFontSize] = useState<number>();
  const [validationErrors, setValidationErrors] = useState<readonly Error[]>();
  const hostRef = useRef<IDemoHost<any>>(null);
  const canvasWrapper = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const canvas2D = useRef<HTMLCanvasElement>(null);
  const previewCanvas = useRef<HTMLCanvasElement>(null);
  const allotmentRef = useRef(null);
  const demoEditUrlEndpoint = useBaseUrl(editUrl);
  const demoEditUrl = new URL(siteConfig.presets[0][1]["docs"].editUrl + demoEditUrlEndpoint).toString();

  const dts_files = [WebAppDTS, GlMatrixDTS, DataJsApiDTS];

  useEffect(() => {
    (async () => await runDemo())();
  }, [canvas, canvas2D, previewCanvas]);

  useEffect(() => {
    (async () => {
      if (codeOutput) {
        try {
          const encodedJs = encodeURIComponent(codeOutput);
          const dataUri = `data:text/javascript;charset=utf-8,${encodedJs}`;
          const module = await import(/* webpackIgnore: true */ dataUri);

          const errors = hostRef.current.updateModule(module);
          console.log("validation errors ==> ", errors);
          setValidationErrors(errors as Error[])

          setIsActivity(false);

        } catch (error) {
          setIsActivity(false);
          console.warn("something bad happened ", error);
        }
      }
    })();

  }, [codeOutput]);

  useEffect(() => {
    console.log("playgroundConfig ", editorConfig);
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
      console.log("Failed to get transpiled output, details ==> ", error);
    }
  };

  const codeChangeHandler = async (tsCode: string) => {
    setIsActivity(true); // toggle spinner.
    setTsCodeForClipboard(tsCode); // for clipboard copy
    const output = await returnTranspiledOutput(editorInstance.current, monaco);

    // compare current output with previous output to check if anything has
    // been changed.
    if (codeOutput && JSON.stringify(codeOutput) === JSON.stringify(output)) {
      console.log("[INFO]: Code hasn't been changed, returning.");
      setIsActivity(false); // toggle spinner.
      return false;
    }

    // set current output in state so we can compare later
    setCodeOutput(output);
    setHasMainChanged(true);
  };

  useEffect(() => {
    let unblock;
    if (hasMainChanged) {
      // Block navigation and register a callback that
      // fires when a navigation attempt is blocked.
      unblock = history.block((tx) => {
        // Navigation was blocked! Let's show a confirmation dialog
        // so the user can decide if they actually want to navigate
        // away and discard changes they've made in the current page.
        if (window.confirm("Are you sure you want to leave this page? changes you made could be lost.")) {
          return unblock();
        }
        return false;
      });
      window.addEventListener("beforeunload", unloadEventHandler);
    }

    return () => {
      window.removeEventListener("beforeunload", unloadEventHandler);
      if (unblock) {
        unblock();
      }
    };
  }, [hasMainChanged]);

  useEffect(() => {
    return () => {
      hostRef.current.exit();
      window.removeEventListener("beforeunload", unloadEventHandler);
    };
  }, []);

  const unloadEventHandler = (e) => {
    if (hasMainChanged) {
      e.preventDefault();
      return (e.returnValue = "");
    }
  };

  // handle editor theme based on docusaurus colorMode.
  useEffect(() => {
    setTheme(colorMode === "dark" ? "vs-dark" : "light");
  }, [colorMode]);

  useEffect(() => {
    if (monaco) {

      monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
        ...monaco.languages.typescript.typescriptDefaults.getCompilerOptions(),
        strict: false,
        noImplicitAny: false,
        noImplicitThis: false,
        strictNullChecks: false,
        strictFunctionTypes: false,
        strictPropertyInitialization: false,
        noUnusedLocals: false,
        noUnusedParameters: false,
        noEmitOnError: true
      });

      // Add additional d.ts files to the JavaScript language service.
      dts_files.forEach(dts => monaco.languages.typescript.typescriptDefaults.addExtraLib(dts));
      monaco.languages.typescript.typescriptDefaults.addExtraLib(
        `/**
             * @description opens an alert that displays provided content
             * @param content string to show in the alert
             */
            declare function openAlert(content:string, type: 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'danger' = 'info'):void

            /**
            * @description opens a pane in bottom left of renderer to show any text
            * @param content string to show in the info pane
            */
            declare function openInfoPane(content: object | string | any, title?: string): void;`
      );

      // const moduleUri = monaco.Uri.file("module.ts");
      const mainUri = monaco.Uri.file("main.ts");

      // if (!monaco.editor.getModel(moduleUri)) {
      //   const moduleCode = apiProxy;
      //   monaco.editor.createModel(moduleCode, "typescript", moduleUri);
      // }

      // When resolving definitions and references, the editor will try to use created models.
      // Creating a model for the library allows "peek definition/references" commands to work with the library.
      if (!monaco.editor.getModel(mainUri)) {
        monaco.editor.createModel("", "typescript", mainUri);
      }
    }
  }, [monaco]);

  async function runDemo() {
    (async () => {
      if (canvas.current && canvas2D.current, previewCanvas.current) {
        const context = await createDemoContext({ primaryCanvas: canvas.current, canvas2D: canvas2D.current, previewCanvas: previewCanvas.current });
        const host = new hostCtor(context);
        hostRef.current = host;
        await host.run();
      }
    })();
  }

  function handleEditorWillMount(monaco) {
    fetch(themeURL)
      .then(data => data.json())
      .then(data => {
        monaco.editor.defineTheme('oceanic-next', data);
        monaco.editor.setTheme('oceanic-next');
      });

    configureFontSize();
  }

  function configureFontSize(size?: number): void {
    const lsKey = "playground.fontSize";
    const fontSize = size || Number(localStorage.getItem(lsKey)) || 14; // default font-size 14;
    localStorage.setItem(lsKey, fontSize.toString());
    setFontSize(fontSize);
  }

  async function handleEditorDidMount(editor: editor.ICodeEditor, monaco: Monaco) {
    setIsActivity(true); // toggle spinner
    editorInstance.current = editor;

    // hide hidden ranges upon init
    toggleHiddenAreas(isHiddenAreasShowing, editor, monaco);

    if (editorConfig.mode === "inline") {
      const contentHeight = Math.min(420, editorConfig.contentHeight ?? editor.getContentHeight());
      allotmentRef.current.resize([contentHeight]);
    }

    const model = editor.getModel();
    // highlight ranges based on comments "\\ HighlightedRangeStarted \\ HighlightRangeEnded"
    const rangesToHighlight = model.findMatches("//\\s*HighlightedRangeStarted\n([\\s\\S\\n]*?)//\\s*HighlightedRangeEnded", false, true, false, null, true);
    if (rangesToHighlight && rangesToHighlight.length) {
      let _rangesToHighlight = [];
      let _rangesToRemove = [];

      rangesToHighlight.map((r) => {
        _rangesToHighlight.push({
          range: new monaco.Range(r.range.startLineNumber === 0 ? r.range.startLineNumber : r.range.startLineNumber + 1, 0, r.range.endLineNumber - 1, 0),
          options: {
            inlineClassName: "playground-monaco-inline-decoration",
            isWholeLine: true,
          },
        });
        _rangesToRemove.push(
          {
            range: new monaco.Range(r.range.startLineNumber, 0, r.range.startLineNumber + 1, 0),
            text: null,
          },
          {
            range: new monaco.Range(r.range.endLineNumber, 0, r.range.endLineNumber + 1, 0),
            text: null,
          }
        );
      });

      editor.deltaDecorations([], _rangesToHighlight);
      model.applyEdits(_rangesToRemove);
    }

    await editor.getAction("editor.action.formatDocument").run();
    if (editorConfig.cursorPosition) {
      editor.setPosition(editorConfig.cursorPosition);
    }
    if (editorConfig.revealLine) {
      editor.revealLineNearTop(editorConfig.revealLine);
    }
    const output = await returnTranspiledOutput(editor, monaco);
    setCodeOutput(output);
    // const { showTip } = await returnRenderConfigFromOutput(output);

    // if (showTip) {
    //   try {
    //     showTip();
    //   } catch (error) {
    //     console.error("An error occurred while trying to execute showTip");
    //   }
    // }

    setIsActivity(false); // toggle spinner
  }

  // toggle hidden areas in the editor
  function toggleHiddenAreas(show: boolean, editor: editor.ICodeEditor, monacoInstance: Monaco): void {
    if (show) {
      // @ts-expect-error
      editor.setHiddenAreas([]);
    } else {
      const model = editor.getModel();
      // hide ranges based on comments "\\ HiddenRangeStarted \\ HiddenRangeEnded"
      const rangesToHide = model.findMatches("//\\s*HiddenRangeStarted\n([\\s\\S\\n]*?)//\\s*HiddenRangeEnded", false, true, false, null, true);
      console.log("rangesToHide ", rangesToHide);
      if (rangesToHide && rangesToHide.length) {
        // @ts-expect-error
        editor.setHiddenAreas(rangesToHide.map((r) => new monacoInstance.Range(r.range.startLineNumber, 0, r.range.endLineNumber, 0)));
      }
    }

    setIsHiddenAreasShowing(show);
  }

  function handleEditorValidation(markers) {
    console.log("markers ", markers);
    if (markers.length && markers[0].severity > 1) {
      console.log("diags ", markers[0]);
      const diagnostic = markers[0];
      setCodeError(diagnostic);
    } else {
      setCodeError(null);
    }
  }

  // copy the current code output to clipboard
  function copyToClipboard() {
    textAreaInstance.current.select();
    document.execCommand("copy");
  }

  // download the contents of current canvas as image
  function downloadCanvasAsImage(): void {
    let link = document.createElement("a");
    link.download = `${fileName}.png`;
    link.href = canvas.current.toDataURL();
    link.click();
    link.remove();
  }

  // change split pane mode to vertical or horizontal
  function changeSplitPaneRotation(): void {
    hostRef.current.exit();
    hostRef.current = null;
    set_force_rerender_allotment(false); // hide the allotment component
    setSplitPaneDirectionVertical(!splitPaneDirectionVertical); // update position
    setTimeout(async () => {
      set_force_rerender_allotment(true); // render the allotment component again
      await runDemo();
      setCodeOutput(codeOutput + " ");
    }, 50);
  }

  // toggle canvas fullscreen mode
  function toggleCanvasFullscreenMode(): void {
    canvasWrapper.current.requestFullscreen().catch((e) => {
      console.log("Failed to request fullscreen => ", e);
      alert("Failed to expand canvas");
    });
  }

  return (
    <BrowserOnly>
      {() => (
        <Fragment>
          <nav className="navbar playground_navbar" ref={editorNavbarInstance}>
            <div className="navbar__inner">
              <div className="navbar__items">
                {/* Demo description popover */}
                <Popover
                  isOpen={isDemoDescPopoverOpen}
                  positions={["bottom", "right", "top", "left"]}
                  parentElement={editorConfig.mode === "inline" ? editorNavbarInstance.current : undefined}
                  content={
                    <div className="popover-content">
                      <p>{description || "There is no description provided for this demo."}</p>
                    </div>
                  }
                >
                  <button
                    onMouseEnter={() => {
                      setIsDemoDescPopoverOpen(true);
                    }}
                    onMouseLeave={() => {
                      setIsDemoDescPopoverOpen(false);
                    }}
                    className="clean-btn navbar__item"
                  >
                    <FontAwesomeIcon icon={faCircleInfo} className="fa-icon size-14" style={{ color: "var(--ifm-color-secondary-darkest)" }} />
                  </button>
                </Popover>
                {demoName}
                {isActivity && <Spinner />}
              </div>

              <div className="navbar__items navbar__items--right" style={{ height: "100%" }}>
                <div className="dropdown dropdown--hoverable dropdown--right">
                  {/* editor settings */}
                  <button className="clean-btn navbar__item" title="Configure editor settings">
                    <FontAwesomeIcon icon={faGear} className="fa-icon size-16" />
                  </button>
                  <ul className={`dropdown__menu editor-config-dropdown`}>
                    {/* Font Size config */}
                    <li>
                      <span>Font Size: </span>
                      <div>
                        {[10, 12, 14, 16, 18].map((size) => (
                          <button
                            onClick={() => {
                              configureFontSize(size);
                            }}
                            className={`button button--primary font-size-button ${fontSize !== size ? "button--outline" : ""}`}
                            key={size}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                      <hr />
                    </li>
                    {/* toggle hidden areas in the editor */}
                    <li>
                      <span>Show/Hide boilerplate code: </span>
                      <div>
                        {["Show", "Hide"].map((e) => (
                          <button
                            onClick={() => {
                              toggleHiddenAreas(e === "Show", editorInstance.current, monaco);
                            }}
                            className={`button button--primary hidden-areas-toggle-button ${(e === "Show" && isHiddenAreasShowing) || (e === "Hide" && !isHiddenAreasShowing) ? "" : "button--outline"}`}
                            key={e}
                          >
                            {e}
                          </button>
                        ))}
                      </div>
                      <hr />
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </nav>

          <div
            style={{
              height: Boolean(editorHeight) && Boolean(rendererHeight) && editorHeight + rendererHeight,
            }}
          >
            {force_rerender_allotment && (
              <Allotment
                ref={allotmentRef}
                vertical={splitPaneDirectionVertical}
                onChange={(e: Array<number>) => {
                  if (e?.length > 1) {
                    if (splitPaneDirectionVertical) {
                      setEditorHeight(e[0]);
                      setRendererHeight(e[1]);
                    } else {
                      setRendererPaneWidth(e[1]);
                    }
                  }
                }}
              >
                <div style={{ position: "relative" }}>
                  <Editor
                    height={splitPaneDirectionVertical ? editorHeight : editorHeight + rendererHeight}
                    defaultLanguage="typescript"
                    value={code}
                    onChange={codeChangeHandler}
                    loading="loading the playground"
                    theme={theme}
                    options={{ fontSize, ...editorOptions }}
                    onMount={handleEditorDidMount}
                    beforeMount={handleEditorWillMount}
                    onValidate={handleEditorValidation}
                  />
                  {codeError && (
                    <div className="editor-error-alert">
                      <Admonition type="danger" title={`error on line: ${codeError.endLineNumber}, column: ${codeError.endColumn}`}>
                        <p>{codeError.message}</p>
                      </Admonition>
                    </div>
                  )}
                </div>
                {true ? (
                  <Renderer
                    canvasWrapperRef={canvasWrapper}
                    canvasRef={canvas}
                    canvas2DRef={canvas2D}
                    previewCanvasRef={previewCanvas}
                    panesHeight={splitPaneDirectionVertical ? rendererHeight : editorHeight + rendererHeight}
                    panesWidth={rendererPaneWidth}
                    editorConfig={editorConfig}
                    splitPaneDirectionVertical={splitPaneDirectionVertical}
                    validationErrors={validationErrors}
                  />
                ) : (
                  <div
                    style={{
                      height: splitPaneDirectionVertical ? rendererHeight : editorHeight + rendererHeight,
                    }}
                    className="renderer-loading-message"
                  >
                    Loading the renderer...
                  </div>
                )}
              </Allotment>
            )}
          </div>
          <textarea ref={textAreaInstance} defaultValue={tsCodeForClipboard} style={{ position: "absolute", width: 0, height: 0, top: 5 }} />

          <nav className="navbar playground_footer_navbar" ref={editorFooterInstance} style={{}}>
            <div className="navbar__inner">
              <div className="navbar__items" style={{ height: "100%" }}>
                {/* Messages/alert popover */}
                <Popover
                  isOpen={isMessagesAndAlertPopoverOpen}
                  positions={["top", "right", "bottom", "left"]}
                  parentElement={editorConfig.mode === "inline" ? editorFooterInstance.current : undefined}
                  content={
                    <div className="popover-content">
                      <p>WebGL Web API: {devDependencies["@novorender/api"]}</p>
                      <hr />
                      <ol>{messagesAndAlerts?.length ? messagesAndAlerts.map((m, i) => <li key={i}>{m}</li>) : <li>No messages or warnings at the moment.</li>}</ol>
                    </div>
                  }
                >
                  <button
                    onMouseEnter={() => {
                      setIsMessagesAndAlertPopoverOpen(true);
                    }}
                    onMouseLeave={() => {
                      setIsMessagesAndAlertPopoverOpen(false);
                    }}
                    className="clean-btn navbar__item"
                    title="messages and alerts"
                    style={{ marginTop: "-2px", marginLeft: "-12px" }}
                  >
                    <FontAwesomeIcon icon={faCircleInfo} className="fa-icon size-14" style={messagesAndAlerts.length ? { color: "var(--ifm-color-warning-darkest)" } : { color: "var(--ifm-color-gray-800)" }} />
                  </button>
                </Popover>
              </div>

              <div className="navbar__items navbar__items--right" style={{ height: "100%" }}>
                {/* open the demo in playground */}
                {editorConfig.mode === "inline" && (
                  <Link className="navbar__item" title="Open this demo in the Playground" to={`/playground/run?id=${dirName}___${demoName}`}>
                    <FontAwesomeIcon icon={faSquareArrowUpRight} className="fa-icon size-14" />
                  </Link>
                )}

                {/* expand canvas to fullscreen */}
                <button onClick={toggleCanvasFullscreenMode} className="clean-btn navbar__item" title="Expand the canvas to fullscreen">
                  <FontAwesomeIcon icon={faUpRightAndDownLeftFromCenter} className="fa-icon size-14" />
                </button>

                {/* Pane mode change */}
                <button onClick={changeSplitPaneRotation} className="clean-btn navbar__item" title="Change split pane mode" style={{ marginTop: 4 }}>
                  <RotationIconSvg className="editor-svg-icon" />
                </button>

                {/* Download image */}
                <button onClick={downloadCanvasAsImage} disabled={!canvas.current} className="clean-btn navbar__item" title="Download current view as image">
                  <FontAwesomeIcon icon={faDownload} className="fa-icon size-14" />
                </button>

                {/* Copy snippet */}
                <button onClick={copyToClipboard} className="clean-btn navbar__item" title="Copy TypeScript code to clipboard">
                  <FontAwesomeIcon icon={faCopy} className="fa-icon size-14" />
                </button>

                {/* Edit snippet */}
                <a href={demoEditUrl} className="navbar__item" title="Edit this code snippet on Github" target="_blank">
                  <FontAwesomeIcon icon={faPenToSquare} className="fa-icon size-14" />
                </a>
              </div>
            </div>
          </nav>
        </Fragment>
      )}
    </BrowserOnly>
  );
}
