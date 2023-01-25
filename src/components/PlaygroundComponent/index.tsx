import React, { useContext, useEffect, useState } from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import { useColorMode } from '@docusaurus/theme-common';
import { PlaygroundContext } from '@site/src/theme/context';
import { WellKnownSceneUrls } from '@site/src/shared';
import type { CameraControllerParams, RenderSettingsParams } from '@novorender/webgl-api';
import MonacoWrapper from '../MonacoWrapper';
import './index.styles.css';
import useBaseUrl from "@docusaurus/useBaseUrl";
import type { IPlaygroundConfig } from "@site/demo-snippets/misc";

export const predefined_scenes = ['cube', 'condos', 'oilrig', 'empty'] as const;

interface props {
    code?: string; // code to run in the editor, only required if `renderSettings` is not provided.
    renderSettings?: RenderSettingsParams; // renderSettings for the view, only required if `code` is not provided
    scene?: WellKnownSceneUrls; // default scene to select, only required if `renderSettings` is provided
    demoName: string; // a name for this demo
    editUrl?: string; // relative path to the file that contains the demo code snippet, e.g. `demo-snippets/tutorials/some-snippet.ts`
    previewImageUrl?: string; // path to the placeholder image file that will be shown when the editor is not running, e.g. `assets/demo-screenshots/some-image.jpg`
    config?: IPlaygroundConfig; // editor/playground internal config
    cameraController?: CameraControllerParams; // default camera controller to select, optionally required if `renderSettings` is provided.
};

export default function PlaygroundComponent({ code, renderSettings, scene, demoName, cameraController = { kind: 'static' }, config, editUrl, previewImageUrl }: props): JSX.Element {

    const [isPlaygroundActive, setIsPlaygroundActive] = useState<boolean>(false);
    const { runningPlaygroundId, setRunningPlaygroundId } = useContext(PlaygroundContext);
    const { colorMode } = useColorMode();

    useEffect(() => {
        if (!demoName) { console.error('Prop `demoName` is required and must be unique'); return; };

    }, []);

    const runPlayground = (): void => {
        setRunningPlaygroundId(demoName);
        setIsPlaygroundActive(true);
    };


    return (
        <BrowserOnly fallback={<div>Loading...</div>}>
            {
                () =>
                    <div>
                        {config &&
                            <div style={config.mode === 'inline' ? { width: 769, border: '2px solid #d5275d33', padding: 5 } : { height: 'calc(100vh - 60px)', overflow: 'hidden', paddingTop: 2 }}>
                                {config.clickToRun && (!isPlaygroundActive || (isPlaygroundActive && demoName !== runningPlaygroundId)) ?
                                    <div style={{ position: 'relative' }}>
                                        <button onClick={runPlayground} className="cu-button">Click to run the demo</button>
                                        {previewImageUrl && <>
                                            <img src={useBaseUrl(`assets/playground-placeholder-${colorMode}.png`)} style={{ filter: 'blur(2px)' }} />
                                            <img src={useBaseUrl(previewImageUrl)} onError={(e) => {
                                                e.currentTarget.src=require(`@site/static/assets/playground-demo-placeholder-dark.png`).default
                                            }} style={{ width: '100%', position: 'absolute', display: 'block', bottom: 42 }} />
                                        </>}
                                    </div>
                                    : <MonacoWrapper code={code} renderSettings={renderSettings} scene={scene} demoName={demoName} playgroundConfig={config} cameraController={cameraController} editUrl={editUrl}></MonacoWrapper>}
                            </div>
                        }
                    </div>
            }
        </BrowserOnly>
    );
}