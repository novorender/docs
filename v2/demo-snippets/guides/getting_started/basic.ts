import type { RenderStateChanges } from "@novorender/api";

export function main(): RenderStateChanges {
  return { grid: { enabled: true } };
}
