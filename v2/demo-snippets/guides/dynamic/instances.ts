import { createCubeObject, type RenderStateDynamicInstance, type RenderStateChanges, type RenderStateDynamicObject } from "@novorender/api";

export function main(): RenderStateChanges {
  const cube = createCubeObject();
  const instances: RenderStateDynamicInstance[] = [];
  const dim = 10;
  const scale = 1 / dim;
  const t = (v: number) => (v - (dim - 1) / 2) * 5 * scale;
  for (let z = 0; z < dim; z++) {
    for (let y = 0; y < dim; y++) {
      for (let x = 0; x < dim; x++) {
        instances.push({ position: [t(x), t(y), t(z)], scale });
      }
    }
  }
  const instancedCube: RenderStateDynamicObject = {
    mesh: cube.mesh,
    instances, // generated instances
  };
  return { dynamic: { objects: [instancedCube] } };
}
