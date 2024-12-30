import { createColorSetHighlight, createTransparentHighlight, type RenderStateChanges } from "@novorender/api";

export function main(): RenderStateChanges {
    const limeGreen = createColorSetHighlight([0, 1, 0]);
    const semiTransparent = createTransparentHighlight(0.5);
    const objectIds = [2, 2221, 3189]; // list of objects that we want to highlight
    return {
        highlights: {
            defaultAction: semiTransparent, // applies to all objects not in a group.
            groups: [{ action: limeGreen, objectIds }],
        },
    };
}
