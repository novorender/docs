import React, { useContext, useEffect, useState } from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import { useColorMode } from '@docusaurus/theme-common';
import { PlaygroundContext } from '@site/src/theme/context';
import { WellKnownSceneUrls } from '@site/src/shared';
import type { CameraControllerParams, RenderSettingsParams } from '@novorender/webgl-api';
import MonacoWrapper from '../MonacoWrapper';
import './index.styles.css';
import useBaseUrl from "@docusaurus/useBaseUrl";
import type { IDempProps } from "@site/demo-snippets/misc";

export const predefined_scenes = ['cube', 'condos', 'oilrig', 'empty'] as const;


export interface IProps extends IDempProps {
    renderSettings?: RenderSettingsParams; // renderSettings for the view, only required if `code` is not provided
    scene?: WellKnownSceneUrls; // default scene to select, only required if `renderSettings` is provided
    cameraController?: CameraControllerParams; // default camera controller to select, optionally required if `renderSettings` is provided.
};

export default function PlaygroundComponent({ code, renderSettings, scene, demoName, description, cameraController = { kind: 'static' }, editorConfig, editUrl, previewImageUrl }: IProps): JSX.Element {

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
                        {editorConfig &&
                            <div style={editorConfig.mode === 'inline' ? { width: 769, border: '2px solid #d5275d33', padding: 5 } : { height: 'calc(100vh - 60px)', overflow: 'hidden', paddingTop: 2 }}>
                                {editorConfig.clickToRun && (!isPlaygroundActive || (isPlaygroundActive && demoName !== runningPlaygroundId))
                                    ? <div style={{ position: 'relative' }}>
                                        <button onClick={runPlayground} className="cu-button">Click to run the demo</button>
                                        {previewImageUrl && <>
                                            <img src={useBaseUrl(`assets/playground-placeholder-${colorMode}.png`)} style={{ filter: 'blur(2px)' }} />
                                            <img src={useBaseUrl(previewImageUrl)} onError={(e) => {
                                                e.currentTarget.src = require(`@site/static/assets/playground-demo-placeholder-dark.png`).default;
                                            }} style={{ width: '100%', position: 'absolute', display: 'block', bottom: 42 }} />
                                        </>}
                                    </div>
                                    : <MonacoWrapper code={code} renderSettings={renderSettings} scene={scene} demoName={demoName} description={description} editorConfig={editorConfig} cameraController={cameraController} editUrl={editUrl}></MonacoWrapper>}
                            </div>
                        }
                    </div>
            }
        </BrowserOnly>
    );
}