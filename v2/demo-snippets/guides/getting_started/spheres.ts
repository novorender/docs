import { createSphereObject, type RenderStateChanges, type RenderStateDynamicInstance } from "@novorender/api";

export function main(): RenderStateChanges {
  const sphere = createSphereObject();
  const instances: RenderStateDynamicInstance[] = [{ position: [-2, 0, 0] }, { position: [+2, 0, 0] }];
  const sphereInstances = { ...sphere, instances };
  return { dynamic: { objects: [sphereInstances] } };
}
