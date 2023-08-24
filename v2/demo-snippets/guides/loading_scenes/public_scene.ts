import * as dataJsApi from "@novorender/data-js-api";
import { type View } from "@novorender/api";
import { type ReadonlyVec3 } from "gl-matrix";

const DATA_API_SERVICE_URL = "https://data.novorender.com/api";
export async function main(view: View): Promise<void> {
  // Initialize the data API with the Novorender data server service
  const dataApi = dataJsApi.createAPI({
    serviceUrl: DATA_API_SERVICE_URL,
  });

  try {
    // Load scene metadata
    // Condos scene ID, but can be changed to any public scene ID
    const sceneData = await dataApi.loadScene("95a89d20dd084d9486e383e131242c4c");
    // Destructure relevant properties into variables
    const { url, camera } = sceneData as dataJsApi.SceneData;
    const webgl2Bin = new URL(url);
    // need to append temp path for now
    webgl2Bin.pathname += "webgl2_bin/";
    // Destructure relevant camera properties
    const { position, fieldOfView: fov } = camera as any;
    // load the scene using URL gotten from `sceneData`
    await view.loadSceneFromURL(webgl2Bin);
    // Assign a camera controller
    await view.switchCameraController(camera?.kind as any, { position: flip(position as ReadonlyVec3), fov });
  } catch (error) {
    console.log("Error while loading scene from URL ", error);
  }
}
// HiddenRangeStarted
/**
 *  helper function to flip the coordinate system
 */
function flip(v: ReadonlyVec3): ReadonlyVec3 {
  const flipped: [number, number, number] = [v[0], -v[2], v[1]];
  return flipped;
}
// HiddenRangeEnded
