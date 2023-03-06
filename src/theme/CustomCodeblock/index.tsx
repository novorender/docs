import React from "react";
import CodeBlock from "@theme/CodeBlock";
import type { Props } from "@theme/CodeBlock";

export interface CustomCodeBlockProps extends Props {
  methodName: string;
  codeBlockNumber: number;
}

export const transform = (children, methodName, codeBlockNumber) => {
  const regex = new RegExp("(" + methodName + "+)\\(.*\\).*\\s*\\{.*?//\\s*begin_code_block_" + codeBlockNumber + "\\s*\n(.*?)\n\\s*//\\s*end_code_block_" + codeBlockNumber + ".*?\\}", "gs");
  const matches = Array.from(children.matchAll(regex));
  return (matches.length && matches[0]) || [`${methodName} not found!`];
};

/**
 * @description takes a webpack raw-loader input and spits out specified codeblock
 * @param props CustomCodeBlockProps
 * @returns CodeBlock
 * @example
 * ```
 * [sampleFile.ts]
 *
 * // BLOCK 1 START <~~ a block must be marked by following syntax
 *  function helloWorld(name: string): string {
 *   return `Hello ${name}`;
 * }
 * // BLOCK 2 END <~~ specify where the codeblock is ending
 *
 * <CodeBlockCustom language="typescript" block="1">{webpack raw loader output here}</CodeBlockCustom>
 *
 * ```
 */
export default function CodeBlockCustom({ children, methodName, codeBlockNumber, language }: CustomCodeBlockProps): JSX.Element {
  const regexMatches = transform(children, methodName, codeBlockNumber);
  return (
    <CodeBlock language={language} title={regexMatches[1]}>
      {regexMatches[2] ?? regexMatches[0]}
    </CodeBlock>
  );
}
