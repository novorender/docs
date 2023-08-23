import type { RenderStateChanges } from "@novorender/api";

export function main(): RenderStateChanges {
  return {
    grid: {
      enabled: true,
      distance: -1, // distance must be a positive number
    },
  };
}
