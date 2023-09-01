import { createAPI, type SceneData } from "@novorender/data-js-api";
import { type View } from "@novorender/api";

const DATA_API_SERVICE_URL = "https://data.novorender.com/api";
export async function main(view: View): Promise<void> {
  // For the demo we have simplified the login flow to always run the login call
  const accessToken = await login();
  // Initialize the data API with the Novorender data server service
  // and a callback which returns the auth header with the access token
  const dataApi = createAPI({
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
    const { url } = sceneData as SceneData;
    // load the scene using URL gotten from `sceneData`
    const config = await view.loadSceneFromURL(new URL(url));
    const { center, radius } = config.boundingSphere;
    view.activeController.autoFit(center, radius);
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
