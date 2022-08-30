/**
 * every snippet file must follow the same structure as below.
 */

import type { CameraControllerParams, Scene, View, API } from '@novorender/webgl-api';
import { WellKnownSceneUrls } from '../../src/shared';
import renderSettings from './render-settings';

// used for screenshot file name or editor title. 
const demoName: string = 'dynamic-objects';

// scene
const scene: WellKnownSceneUrls = WellKnownSceneUrls.cube;

// camera controller
const cameraController: CameraControllerParams = { kind: 'turntable' }; // optional, defaults to 'static'

async function main(api: API, view: View) {
    const scene = await api.loadScene(WellKnownSceneUrls.empty); // not sure if this works, use cube if not (for now)...
    const asset = await api.loadAsset(" https://api.novorender.com/assets/gltf/excavator.glb");
    const instance = scene.createDynamicObject(asset); // we can make multiple instance from same asset.
    instance.position = [1, 2, 3]; // vec3 from gl-matrix
    instance.visible = true;
    // TODO: do render loop and event handling...
    instance.dispose(); // call to remove instance
}


export {
    renderSettings,
    scene,
    demoName,
    cameraController
};
