
/**
 * every snippet file must follow the same structure as below.
 */
import { WellKnownSceneUrls } from '../../src/shared';
import renderSettings from './render-settings';

// used for screenshot file name or editor title. 
const demoName: string = 'another-test-cube';

// scene
const scene: WellKnownSceneUrls = WellKnownSceneUrls.condos;


export {
    renderSettings,
    scene,
    demoName
};
