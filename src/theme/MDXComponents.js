import React from "react";
// Import the original mapper
import MDXComponents from "@theme-original/MDXComponents";
import PlaygroundComponent from "@site/src/components/PlaygroundComponent";

export default {
    // Re-use the default mapping
    ...MDXComponents,
    // Map the "PlaygroundComponent" tag to our <PlaygroundComponent /> component!
    // `PlaygroundComponent` will receive all props that were passed to `PlaygroundComponent` in MDX
    PlaygroundComponent: PlaygroundComponent,
};
