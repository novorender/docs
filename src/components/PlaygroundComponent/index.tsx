import React, { useContext, useEffect, useState } from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import { useColorMode } from '@docusaurus/theme-common';
import { PlaygroundContext } from '@site/src/theme/context';
import MonacoWrapper from '../MonacoWrapper';

/** CSS */
import './index.styles.css';
/** CSS END */

/** Types */
import type { IDempProps } from "@site/demo-snippets/misc";
/** Types END */

export default function PlaygroundComponent({ code, demoName, description, editorConfig, editUrl, previewImageUrl, dirName }: IDempProps): JSX.Element {

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
                                            <img src={`/assets/playground-placeholder-${colorMode}.png`} style={{ filter: 'blur(2px)' }} />
                                            <img src={previewImageUrl} onError={(e) => {
                                                e.currentTarget.src = require(`@site/static/assets/playground-demo-placeholder-dark.png`).default;
                                            }} style={{ width: '100%', position: 'absolute', display: 'block', bottom: 42 }} />
                                        </>}
                                    </div>
                                    : <MonacoWrapper code={code} demoName={demoName} description={description} editorConfig={editorConfig} editUrl={editUrl} dirName={dirName}></MonacoWrapper>}
                            </div>
                        }
                    </div>
            }
        </BrowserOnly>
    );
}