/**
 * every snippet file must follow the same structure as below.
 */

import type { CameraControllerParams } from '@novorender/webgl-api';
import { WellKnownSceneUrls } from '../../src/shared';
import renderSettings from './render-settings';

// used for screenshot file name or editor title. 
const demoName: string = 'simple-cube';

// scene
const scene: WellKnownSceneUrls = WellKnownSceneUrls.cube;

// camera controller
const cameraController: CameraControllerParams = { kind: 'turntable' }; // optional, defaults to 'static'

export {
    renderSettings,
    scene,
    demoName,
    cameraController
};
