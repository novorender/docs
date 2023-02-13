import type { IPosition } from "monaco-editor";

export type IDemo = Record<string, IDempProps>;

export interface IEditorConfig {
    /** should playground start automatically? defaults to `true` */
    clickToRun?: boolean;
    /** whether to enable a secondary canvas for 2D or not, defaults to `true` */
    canvas2D?: boolean;
    /** using `fill` will make the playground to take entire viewport's width and height, `inline` is default */
    mode?: 'inline' | 'fill';
    /** Set the primary position of the cursor, defaults to `{ column: 1, lineNumber: 15 }` (https://microsoft.github.io/monaco-editor/api/interfaces/monaco.editor.IEditor.html#setPosition)*/
    cursorPosition?: IPosition;
    /** Scroll vertically as necessary and reveal a line close to the top of the viewport, defaults to `20` (https://microsoft.github.io/monaco-editor/api/interfaces/monaco.editor.IEditor.html#revealLineNearTop) */
    revealLine?: number;
    /** Lines to hide in the editor 
     * @deprecated use `// HiddenRangeStarted` and `// HiddenRangeEnded` within snippets.
     * see usage example below:
     * ```
     * // HiddenRangeStarted
     * some code that needs to be hidden
     * another line of code that will also be hidden....
     * // HiddenRangeEnded
     * ```
    */
    hiddenAreas?: Array<{ startLineNumber: number, endLineNumber: number; }>;
};
export interface IDempProps {
    /** Directory that contains this demo, e.g. `getting_started/condos.ts`, `getting_started` is the dirName here */
    dirName: string;
    /** A friendly name for the demo (must be unique) */
    demoName: string;
    /** editor config */
    editorConfig: IEditorConfig;
    /** Github edit URL, should be relative path e.g. `demo-snippets/tutorials/clipping_volumes/box.ts` */
    editUrl: string;
    code: string;
    /** preview image URL for the playground, sample: `assets/demo-screenshots/imageName.png` */
    previewImageUrl?: string;
    /** short description for this demo */
    description: string;
}

export function demo<T extends string>(
    dirName: string,
    demoName: T,
    code: string,
    config: IEditorConfig = {},
    desc?: string
): IDemo {
    return {
        [demoName]:
            {
                dirName,
                demoName,
                editorConfig: { clickToRun: true, mode: 'inline', canvas2D: true, cursorPosition: { column: 1, lineNumber: 15 }, revealLine: 20, ...config },
                code,
                editUrl: `demo-snippets/tutorials/${dirName}/${demoName}.ts`,
                previewImageUrl: `/assets/demo-screenshots/${demoName}.png`,
                description: desc || 'No Description Available'
            } as const
    } as const;
}
