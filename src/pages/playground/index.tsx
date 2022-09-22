import React from 'react';
import Layout from '@theme/Layout';
import PlaygroundComponent from '@site/src/components/PlaygroundComponent';
import { simpleCubeConfig } from '@site/demo-snippets/index';
// import styles from './about.module.css';


export default function Playground(): JSX.Element {
    return (
        <Layout
            title={`Playground`}
            description="Webgl-api playground">
            <PlaygroundComponent renderSettings={simpleCubeConfig.renderSettings} demoName={simpleCubeConfig.demoName} scene={simpleCubeConfig.scene} cameraController={simpleCubeConfig.cameraController} config={{ mode: 'fill', clickToRun: false }}></PlaygroundComponent>
        </Layout>
    );
} 
