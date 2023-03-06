import React, { useEffect, useRef, useState } from "react";
import BrowserOnly from "@docusaurus/BrowserOnly";
import CodeBlock from "@theme/CodeBlock";
import { Allotment } from "allotment";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as dataJsApi from "@novorender/data-js-api";
import * as glMatrix from "gl-matrix";
import Spinner from "../misc/spinner";

/** Icons */
import { faReceipt, faCircleChevronDown } from "@fortawesome/free-solid-svg-icons";
/** Icons end */

/** Types */
// import type { API } from "@novorender/webgl-api";
import * as NovoRender from "@novorender/webgl-api";
import * as MeasureAPI from "@novorender/measure-api";
import type { IEditorConfig } from "@site/demo-snippets/misc";
/** Types END */

interface Props {
  main: ({}: any) => void;
  webglApi: typeof NovoRender;
  measureApi: typeof MeasureAPI;
  panesHeight: number;
  panesWidth: number;
  editorConfig: IEditorConfig;
  splitPaneDirectionVertical: boolean;
  isDoingActivity: (a: boolean) => void;
  canvasRef: (a: HTMLCanvasElement) => void;
  canvasWrapperRef: (a: HTMLDivElement) => void;
  onMessagesAndAlert: (m: string) => void;
}

export default function Renderer({ main, isDoingActivity, canvasRef, canvasWrapperRef, webglApi, measureApi, panesHeight, panesWidth, onMessagesAndAlert, editorConfig, splitPaneDirectionVertical }: Props): JSX.Element {
  const canvasWrapper = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const canvas2D = useRef<HTMLCanvasElement>(null);
  const previewCanvas = useRef<HTMLCanvasElement>(null);
  const [canvasDimensions, setCanvasDimensions] = useState<{
    width: number;
    height: number;
  }>({ width: 0, height: 0 });
  // const [apiInstance, setApiInstance] = useState<API>(api.createAPI()); // Create API
  const [infoPaneContent, setInfoPaneContent] = useState<{
    content: string | object | any;
    title?: string;
  }>({ content: "" });
  const [previewCanvasWidth, setPreviewCanvasWidth] = useState<number>(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  // const [_measureApiInstance, setMeasureApiInstance] = useState<MeasureAPI>(measureApiInstance.createMeasureAPI()); // Create API

  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      if (canvas.current) {
        console.log("canvas ", canvas.current);
        for (const entry of entries) {
          setCanvasDimensions({
            width: entry.contentRect.width,
            height: entry.contentRect.height,
          });
        }
      }
    });

    resizeObserver.observe(canvas.current);

    window["openInfoPane"] = (content: object | string | any, title?: string) => {
      setInfoPaneContent({ content, title });
    };

    document.addEventListener("fullscreenchange", fullScreenEventListener, false);
    /**
     * to prevent page scrolling when user actually tries to do the zoom in or out on canvas
     * not sure if this can cause any interference with API's internal events.
     */
    canvas.current.addEventListener("wheel", wheelEventListener, {
      passive: false,
    });
    return () => {
      document.removeEventListener("fullscreenchange", fullScreenEventListener, false);
      canvas?.current?.removeEventListener("wheel", wheelEventListener, false);
    };
  }, []);

  useEffect(() => {
    console.log("main from renderer", main);
    // console.log('api from renderer', apiInstance);
    canvasRef(canvas.current);
    canvasWrapperRef(canvasWrapper.current);
    (async () => {
      try {
        await main({
          webglApi,
          measureApi,
          dataJsApi,
          glMatrix,
          canvas: canvas.current,
          canvas2D: canvas2D.current,
          previewCanvas: previewCanvas.current,
        });
      } catch (err) {
        console.log("something got caught ", err);
      }
    })();
  }, [main]);

  const fullScreenEventListener = () => setIsFullScreen(!!document.fullscreenElement);
  const wheelEventListener = (e: MouseEvent) => {
    if (!isFullScreen) {
      e.preventDefault();
    }
  };

  return (
    <BrowserOnly>
      {() => (
        <div ref={canvasWrapper} style={{ height: panesHeight, position: "relative" }} className="canvas-overscroll-fix">
          <Allotment vertical={!splitPaneDirectionVertical} onChange={(e: Array<number>) => setPreviewCanvasWidth(e[1])}>
            <Allotment.Pane>
              <RenderSpinner />
              <canvas ref={canvas} width={canvasDimensions.width} height={canvasDimensions.height} style={{ width: "100%", height: "100%" }}></canvas>
              {editorConfig?.canvas2D && (
                <canvas
                  ref={canvas2D}
                  width={canvasDimensions.width}
                  height={canvasDimensions.height}
                  style={{
                    pointerEvents: "none",
                    width: "100%",
                    height: "100%",
                    position: "absolute",
                    top: 0,
                    left: 0,
                  }}
                />
              )}
            </Allotment.Pane>
            <Allotment.Pane visible={editorConfig.enablePreviewCanvas}>
              <RenderSpinner />
              <canvas ref={previewCanvas} width={splitPaneDirectionVertical ? previewCanvasWidth : panesWidth} height={!isFullScreen ? panesHeight : innerHeight} />
            </Allotment.Pane>
          </Allotment>
          <InfoBox content={infoPaneContent.content} title={infoPaneContent.title} />
        </div>
      )}
    </BrowserOnly>
  );
}

export function InfoBox({ content, title }: { content: object | string | any; title?: string }) {
  const [isCodeBlock, setIsCodeBlock] = useState(false);

  useEffect(() => {
    setIsCodeBlock(!!content);
  }, [content]);

  return (
    <div
      className="info-pane-container"
      style={{
        position: "absolute",
        bottom: isCodeBlock ? -20 : 0,
        left: 0,
        fontSize: 12,
        margin: 10,
        overflow: "auto",
        maxWidth: "25%",
      }}
    >
      {!isCodeBlock && (
        <button
          onClick={() => {
            setIsCodeBlock(true);
          }}
          title="Show info pane"
          className="button button--outline button--primary"
          style={{ padding: "0 5px", marginBottom: 2 }}
        >
          <FontAwesomeIcon icon={faReceipt} className={`fa-icon size-14 ${content ? "fa-bounce" : ""}`} />
        </button>
      )}
      {isCodeBlock && (
        <button
          onClick={() => {
            setIsCodeBlock(false);
          }}
          title="Hide info pane"
          className="button"
          style={{
            padding: "0px 5px",
            bottom: "-10px",
            zIndex: 99,
            position: "relative",
          }}
        >
          <FontAwesomeIcon icon={faCircleChevronDown} className="fa-icon size-14" />
        </button>
      )}
      {isCodeBlock && (
        <CodeBlock title={title} language="json">
          {(content && JSON.stringify(content, null, 2)) || "Nothing to see here..."}
        </CodeBlock>
      )}
    </div>
  );
}

export const RenderSpinner = () => (
  <Spinner
    wrapperStyles={{
      margin: "auto",
      position: "absolute",
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      zIndex: "-1",
    }}
  />
);
