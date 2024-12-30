import { createColorSetHighlight, type RenderStateChanges } from "@novorender/api";

export function main(): RenderStateChanges {
    const highlight = createColorSetHighlight([0, 1, 0]);
    const objectIds = [2, 2221, 3189]; // list of objects that we want to highlight
    return {
        highlights: {
            groups: [{ action: highlight, objectIds }],
        },
    };
}
