import React, { useEffect, useRef, useState } from "react";
import BrowserOnly from "@docusaurus/BrowserOnly";
import CodeBlock from '@theme/CodeBlock';
import * as DataJsAPI from '@novorender/data-js-api';
import * as glMatrix from 'gl-matrix';
import Spinner from "../misc/spinner";
import { Allotment } from "allotment";

/** Types */
import type { API } from "@novorender/webgl-api";
// import type { MeasureAPI } from "@novorender/measure-api";
import type { IEditorConfig } from "@site/demo-snippets/misc";
/** Types END */

interface Props {
    main: any;
    api: any;
    measureApiInstance: any;
    panesHeight: number;
    panesWidth: number;
    editorConfig: IEditorConfig;
    isDoingActivity: (a: boolean) => void;
    canvasRef: (a: HTMLCanvasElement) => void;
    canvasWrapperRef: (a: HTMLDivElement) => void;
    onMessagesAndAlert: (m: string) => void;
};

export default function Renderer({ main, isDoingActivity, canvasRef, canvasWrapperRef, api, measureApiInstance, panesHeight, panesWidth, onMessagesAndAlert, editorConfig }: Props): JSX.Element {

    const canvasWrapper = useRef<HTMLDivElement>(null);
    const canvas = useRef<HTMLCanvasElement>(null);
    const canvas2D = useRef<HTMLCanvasElement>(null);
    const previewCanvas = useRef<HTMLCanvasElement>(null);
    const [canvasDimensions, setCanvasDimensions] = useState<{ width: number, height: number; }>({ width: 0, height: 0 });
    const [apiInstance, setApiInstance] = useState<API>(api.createAPI()); // Create API
    const [infoPaneContent, setInfoPaneContent] = useState<string | object | any>('');
    const [previewCanvasWidth, setPreviewCanvasWidth] = useState<number>(0);
    const [isFullScreen, setIsFullScreen] = useState(false);
    // const [_measureApiInstance, setMeasureApiInstance] = useState<MeasureAPI>(measureApiInstance.createMeasureAPI()); // Create API

    useEffect(() => {
        const resizeObserver = new ResizeObserver((entries) => {
            if (canvas.current) {
                console.log('canvas ', canvas.current);
                for (const entry of entries) {
                    setCanvasDimensions({ width: entry.contentRect.width, height: entry.contentRect.height });
                }
            }
        });

        resizeObserver.observe(canvas.current);

        window['openInfoPane'] = (content: string) => {
            setInfoPaneContent(content);
        };
    }, []);

    useEffect(() => {
        console.log('main from renderer', main);
        console.log('api from renderer', apiInstance);
        canvasRef(canvas.current);
        canvasWrapperRef(canvasWrapper.current);
        (async () => {
            try {
                await main({ webglAPI: apiInstance, canvas: canvas.current, measureAPI: measureApiInstance, dataJsAPI: DataJsAPI, glMatrix: glMatrix, canvas2D: canvas2D.current, previewCanvas: previewCanvas.current });
            } catch (err) {
                console.log('something got caught ', err);
            }
        })();
    }, [main]);

    useEffect(() => {
        document.addEventListener('fullscreenchange', () => setIsFullScreen(!!document.fullscreenElement), false);
        return () => { document.removeEventListener('fullscreenchange', () => setIsFullScreen(!!document.fullscreenElement), false); };
    });


    return (
        <BrowserOnly>
            {() =>
                <div ref={canvasWrapper} style={{ height: panesHeight, position: 'relative' }} className="canvas-overscroll-fix">
                    <Allotment onChange={(e: Array<number>) => setPreviewCanvasWidth(e[1])}>
                        <Allotment.Pane>
                            <RenderSpinner />
                            <canvas ref={canvas} width={canvasDimensions.width} height={canvasDimensions.height} style={{ width: '100%', height: '100%' }}></canvas>
                            {editorConfig?.canvas2D && <canvas ref={canvas2D} width={canvasDimensions.width} height={canvasDimensions.height} style={{ pointerEvents: 'none', width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }} />}
                        </Allotment.Pane>
                        <Allotment.Pane visible={editorConfig.enablePreviewCanvas}>
                            <RenderSpinner />
                            <canvas ref={previewCanvas} width={previewCanvasWidth} height={!isFullScreen ? panesHeight : innerHeight} />
                        </Allotment.Pane>
                    </Allotment>
                    <InfoBox content={infoPaneContent} />
                </div>
            }
        </BrowserOnly>
    );
}

export function InfoBox({ content }: { content: object | string | any; }) {

    const [isCodeBlock, setIsCodeBlock] = useState(false);

    useEffect(() => {
        setIsCodeBlock(!!content);
    }, [content]);

    return <div className="info-pane-container" style={{ position: 'absolute', bottom: isCodeBlock ? -20 : 0, left: 0, fontSize: 12, margin: 10, overflow: 'auto', maxWidth: '25%' }}>
        {!isCodeBlock && <button onClick={() => { setIsCodeBlock(true); }} title="Show info pane" className="button button--outline button--primary" style={{ padding: '0 5px', marginBottom: 2 }}>ℹ️</button>}
        {isCodeBlock && <button onClick={() => { setIsCodeBlock(false); }} title="Hide info pane" className="button" style={{ padding: '0 5px' }}>➖</button>}
        {isCodeBlock && <CodeBlock language="json">{(content && JSON.stringify(content, null, 2)) || 'Nothing to see here...'}</CodeBlock>}
    </div>;

}

export const RenderSpinner = () => <Spinner wrapperStyles={{ margin: 'auto', position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, zIndex: '-1' }} />;