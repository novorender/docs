import * as dataJsApi from "@novorender/data-js-api";
import { type RenderStateChanges, type View } from "@novorender/api";
import { type ReadonlyVec3, quat } from "gl-matrix";

const DATA_API_SERVICE_URL = "https://data.novorender.com/api";
export async function main(view: View): Promise<RenderStateChanges | undefined> {
  // For the demo we have simplified the login flow to always run the login call
  const accessToken = await login();
  // Initialize the data API with the Novorender data server service
  // and a callback which returns the auth header with the access token
  const dataApi = dataJsApi.createAPI({
    serviceUrl: DATA_API_SERVICE_URL,
    authHeader: async () => ({
      header: "Authorization",
      value: `Bearer ${accessToken}`,
    }),
  });

  try {
    // Load scene metadata
    // Condos scene ID, but can be changed to any public scene ID
    const sceneData = await dataApi.loadScene("7a0a302fe9b24ddeb3c496fb36e932b0");
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
    await view.switchCameraController(camera?.kind as any, { position: flip(position as ReadonlyVec3), fov, rotation: flipGLtoCadQuat([1, 0, 0, 0]) });

    const renderState: RenderStateChanges = {
      grid: {
        enabled: true,
      },
    };

    return renderState;
  } catch (error) {
    console.log("Error while loading scene from URL ", error);
  }
}
// HiddenRangeStarted
async function login(): Promise<string> {
  // Hardcoded values for demo purposes
  const username = "demouser";
  const password = "demopassword";

  // POST to the dataserver service's /user/login endpoint
  const res: { token: string } = await fetch(DATA_API_SERVICE_URL + "/user/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `username=${username}&password=${password}`,
  })
    .then((res) => res.json())
    .catch(() => {
      // Handle however you like
      return { token: "" };
    });

  return res.token;
}

/**
 *  helper function to flip the coordinate system
 */
function flip(v: ReadonlyVec3): ReadonlyVec3 {
  const flipped: [number, number, number] = [v[0], -v[2], v[1]];
  return flipped;
}

/**
 *  helper function to flip the coordinate system
 */
function flipGLtoCadQuat(b: quat) {
  let ax = 0.7071067811865475,
    aw = 0.7071067811865475;
  let bx = b[0],
    by = b[1],
    bz = b[2],
    bw = b[3];

  // prettier-ignore
  return quat.fromValues(
        ax * bw + aw * bx,
        aw * by + - ax * bz,
        aw * bz + ax * by,
        aw * bw - ax * bx);
}
// HiddenRangeEnded
