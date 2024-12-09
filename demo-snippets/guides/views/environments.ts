import { createSphereObject, RenderStateChanges, View } from "@novorender/api";

const { mesh } = createSphereObject();

export async function main(view: View) {
    const envIndexUrl = new URL("https://api.novorender.com/assets/env/index.json");
    const envs = await View.availableEnvironments(envIndexUrl);
    const { url } = envs[2]; // just pick one
    view.modifyRenderState({
        background: { url, blur: 0 }, // may take a while to download
        // add a metallic sphere
        dynamic: {
            objects: [{
                mesh,
                instances: [{ position: [0, 0, 0], scale: 3 }]
            }]
        }
    } as RenderStateChanges);
}
