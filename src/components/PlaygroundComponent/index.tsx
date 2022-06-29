import React, { useContext, useEffect, useState } from 'react';
import { CSSTransition } from 'react-transition-group';
import BrowserOnly from '@docusaurus/BrowserOnly';
import { PlaygroundContext } from '@site/src/theme/context';
import { WellKnownSceneUrls } from '@site/src/shared';
import type { CameraControllerParams, RenderSettingsParams } from '@novorender/webgl-api';
import MonacoWrapper from '../MonacoWrapper';
import './index.styles.css';

export const predefined_scenes = ['cube', 'condos', 'oilrig', 'empty'] as const;

export interface PlaygroundConfig {
    mode: 'inline' | 'fill',
    clickToRun?: boolean
};

interface props {
    children: RenderSettingsParams,
    scene: WellKnownSceneUrls,
    demoName: string,
    config?: PlaygroundConfig,
    cameraController?: CameraControllerParams
};

export default function PlaygroundComponent({ children, scene, demoName, cameraController = { kind: 'static' }, config = { mode: 'inline', clickToRun: true } }: props): JSX.Element {

    const [isPlaygroundActive, setIsPlaygroundActive] = useState<boolean>(false);
    const [showTip, setShowTip] = useState<boolean>(false);
    const { runningPlaygroundId, setRunningPlaygroundId } = useContext(PlaygroundContext);

    useEffect(() => {
        if (!demoName) { console.error('Prop `demoName` is required and must be unique'); return; };
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
                () => <div style={config.mode === 'inline' ? { width: 769, border: '2px solid #d5275d33', padding: 5 } : { height: 'calc(100vh - 60px)', overflow: 'hidden', paddingTop: 2 }}>
                    {config.clickToRun && (!isPlaygroundActive || (isPlaygroundActive && demoName !== runningPlaygroundId)) ?
                        <div style={{ position: 'relative' }} onMouseEnter={() => { toggleTip(true) }} onMouseLeave={() => { toggleTip(false) }}>
                            <CSSTransition in={showTip} timeout={300} classNames={'alert'} unmountOnExit>
                                <button onClick={runPlayground} className="button button--lg button--success" style={{ position: 'absolute', zIndex: 99, right: 0, left: 0, margin: 'auto', top: 0, width: 300, bottom: 0, height: 60 }}>Run this demo</button>
                            </CSSTransition>
                            <img src={require(`@site/static/assets/demo-screenshots/${demoName}.jpg`).default} style={{ width: '100%', height: '100%', display: 'block', filter: showTip ? 'brightness(0.4)' : '' }} />
                        </div>
                        : <MonacoWrapper scene={scene} demoName={demoName} playgroundConfig={config} cameraController={cameraController}>{children}</MonacoWrapper>}
                </div>
            }
        </BrowserOnly>
    )
}