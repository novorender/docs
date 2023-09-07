import { createCubeObject, type RenderStateDynamicInstance, type RenderStateChanges } from "@novorender/api";

const { mesh } = createCubeObject();

export function update(time: number): RenderStateChanges {
    const angle = ((time / 1000) * Math.PI * 2) / 6; // 10 RPM
    const instance: RenderStateDynamicInstance = {
        position: [0, 0, 0],
        rotation: [0, Math.sin(angle / 2), 0, Math.cos(angle / 2)],
    };
    return {
        dynamic: { objects: [{ mesh, instances: [instance] }] },
    };
}
