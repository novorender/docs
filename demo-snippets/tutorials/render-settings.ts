/**
 * *********************************************************************
 * 
 * This file should only contains renderSettings, 
 * check the index.ts for more settings such as scene or environment
 * 
 * *********************************************************************
 */

import type { RenderSettingsParams } from "@novorender/webgl-api";

export default <RenderSettingsParams>{
    background: { color: [10, 0, 0.25, 1] },
    exposure: 1.0,
    grid: {
        enabled: true,
        axisY: [0, 0, 1],
        axisX: [1, 0, 0],
        majorColor: [1, 1, 0],
        majorLineCount: 8,
        minorColor: [1, 1, 1],
        minorLineCount: 3,
        origo: [0, 0, 0]
    }
};