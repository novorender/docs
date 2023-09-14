import React from "react";
// Import the original mapper
import MDXComponents from "@theme-original/MDXComponents";
import PlaygroundComponent from "@site/src/components/PlaygroundComponent";
import CodeLink from "@site/src/components/CodeLink";
import ActionCard from "@site/src/components/DocsActionCard";

export default {
    // Re-use the default mapping
    ...MDXComponents,
    // Map custom components to their corresponding tags
    // these tags will receive all props that were passed to the components in MDX
    PlaygroundComponent: PlaygroundComponent,
    CodeLink: CodeLink,
    ActionCard: ActionCard,
};
