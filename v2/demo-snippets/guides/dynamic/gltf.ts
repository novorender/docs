import { downloadGLTF, type RenderStateChanges } from "@novorender/api";

export async function main(): Promise<RenderStateChanges> {
    const objects = await downloadGLTF(new URL("https://api.novorender.com/assets/gltf/logo.glb"));
    return { dynamic: { objects } };
}
