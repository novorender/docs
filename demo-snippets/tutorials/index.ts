/**
 * every snippet file must follow the same structure as below.
 */
// @ts-expect-error
import main from '!!raw-loader!./dynamic_objects.snippet.ts';

const demoName: string = 'dynamic-objects';

export {
    // renderSettings,
    // scene,
    demoName,
    main
    // cameraController
};
