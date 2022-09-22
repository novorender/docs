import React, { useContext, useEffect, useState } from 'react';
import { CSSTransition } from 'react-transition-group';
import BrowserOnly from '@docusaurus/BrowserOnly';
import { PlaygroundContext } from '@site/src/theme/context';
import { WellKnownSceneUrls } from '@site/src/shared';
import type { CameraControllerParams, RenderSettingsParams } from '@novorender/webgl-api';
import MonacoWrapper from '../MonacoWrapper';
import './index.styles.css';
import useBaseUrl from "@docusaurus/useBaseUrl";

export const predefined_scenes = ['cube', 'condos', 'oilrig', 'empty'] as const;

export interface PlaygroundConfig {
    mode: 'inline' | 'fill'; // using `fill` will make the playground to take entire viewport's width and height, `inline` is default
    clickToRun?: boolean;
};

interface props {
    code?: string; // code to run in the editor, only required if `renderSettings` is not provided.
    renderSettings?: RenderSettingsParams; // renderSettings for the view, only required if `code` is not provided
    scene?: WellKnownSceneUrls; // default scene to select, only required if `renderSettings` is provided
    demoName: string; // a name for this demo
    editUrl?: string; // relative path to the file that contains the demo code snippet, e.g. `demo-snippets/tutorials/some-snippet.ts`
    previewImageUrl?: string; // path to the placeholder image file that will be shown when the editor is not running, e.g. `assets/demo-screenshots/some-image.jpg`
    config?: PlaygroundConfig; // editor/playground internal config
    cameraController?: CameraControllerParams; // default camera controller to select, optionally required if `renderSettings` is provided.
};

export default function PlaygroundComponent({ code, renderSettings, scene, demoName, cameraController = { kind: 'static' }, config, editUrl, previewImageUrl }: props): JSX.Element {

    const [isPlaygroundActive, setIsPlaygroundActive] = useState<boolean>(false);
    const [showTip, setShowTip] = useState<boolean>(false);
    const [playgroundConfig, setPlaygroundConfig] = useState<PlaygroundConfig>();
    const { runningPlaygroundId, setRunningPlaygroundId } = useContext(PlaygroundContext);

    useEffect(() => {
        if (!demoName) { console.error('Prop `demoName` is required and must be unique'); return; };
        console.log("config ", config);
        // console.log(children);

        setPlaygroundConfig({
            mode: config && config.mode || 'inline',
            clickToRun: config && config.clickToRun !== undefined ? config.clickToRun : true
        });

    }, []);

    const runPlayground = (): void => {
        setRunningPlaygroundId(demoName);
        setIsPlaygroundActive(true);
    };

    const toggleTip = (state: boolean): void => {
        setShowTip(state);
    };

    return (
        <BrowserOnly fallback={<div>Loading...</div>}>
            {
                () =>
                    <div>
                        {playgroundConfig &&
                            <div style={playgroundConfig.mode === 'inline' ? { width: 769, border: '2px solid #d5275d33', padding: 5 } : { height: 'calc(100vh - 60px)', overflow: 'hidden', paddingTop: 2 }}>
                                {playgroundConfig.clickToRun && (!isPlaygroundActive || (isPlaygroundActive && demoName !== runningPlaygroundId)) ?
                                    <div style={{ position: 'relative' }} onMouseEnter={() => { toggleTip(true); }} onMouseLeave={() => { toggleTip(false); }}>
                                        <CSSTransition in={showTip} timeout={300} classNames={'alert'} unmountOnExit>
                                            <button onClick={runPlayground} className="button button--lg button--success" style={{ position: 'absolute', zIndex: 99, right: 0, left: 0, margin: 'auto', top: 0, width: 300, bottom: 0, height: 60 }}>Run this demo</button>
                                        </CSSTransition>
                                        {previewImageUrl && <img src={useBaseUrl(previewImageUrl)} style={{ width: '100%', height: '100%', display: 'block', filter: showTip ? 'brightness(0.4)' : '' }} />}
                                    </div>
                                    : <>{playgroundConfig && <MonacoWrapper code={code} renderSettings={renderSettings} scene={scene} demoName={demoName} playgroundConfig={playgroundConfig} cameraController={cameraController} editUrl={editUrl}></MonacoWrapper>}</>}
                            </div>
                        }
                    </div>
            }
        </BrowserOnly>
    );
}