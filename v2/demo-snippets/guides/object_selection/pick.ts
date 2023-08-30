import { type RecursivePartial, type RenderStateHighlightGroups, type View, createColorSetHighlight, createNeutralHighlight } from "@novorender/api";

export function main(canvas: HTMLCanvasElement, view: View, cb: (stateChanges: RecursivePartial<RenderStateHighlightGroups>) => void) {
  const limeGreen = createColorSetHighlight([0, 1, 0]);

  // Listen to click events to pick objects
  canvas.onclick = async (e: MouseEvent) => {
    const result = await view.pick(e.offsetX, e.offsetY);
    if (result) {
      const renderStateHighlightGroups = {
        // Reset existing highlights (if any)
        defaultAction: createNeutralHighlight(),
        // Set selected object to use highlight
        groups: [{ action: limeGreen, objectIds: [result.objectId] }],
      };
      // finally, execute callback function which will modify the render state in the host class
      cb(renderStateHighlightGroups);
    }
  };
}
