import { downloadGLTF, type RenderStateChanges } from "@novorender/api";

export async function main(): Promise<RenderStateChanges> {
    const objects = await downloadGLTF(new URL("https://assets.novorender.com/gltf/logo.glb"));
    return { dynamic: { objects } };
}
