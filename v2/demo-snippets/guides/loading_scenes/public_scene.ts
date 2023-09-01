import { createAPI, type SceneData } from "@novorender/data-js-api";
import { type View } from "@novorender/api";

export async function main(view: View): Promise<void> {
  // Initialize the data API with the Novorender data server service
  const dataApi = createAPI({
    serviceUrl: "https://data.novorender.com/api",
  });

  try {
    // Load scene metadata
    // Condos scene ID, but can be changed to any public scene ID
    const sceneData = await dataApi.loadScene("95a89d20dd084d9486e383e131242c4c");
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
