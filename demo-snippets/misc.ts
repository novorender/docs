import type { IPosition } from "monaco-editor";

export type IDemo = Record<string, IDempProps>;

export interface IPlaygroundConfig {
    /** should playground start automatically? defaults to `true` */
    clickToRun?: boolean;
    /** whether to enable a secondary canvas for 2D or not, defaults to `false` */
    canvas2D?: boolean;
    /** using `fill` will make the playground to take entire viewport's width and height, `inline` is default */
    mode?: 'inline' | 'fill';
    /** Set the primary position of the cursor, defaults to `{ column: 1, lineNumber: 15 }` (https://microsoft.github.io/monaco-editor/api/interfaces/monaco.editor.IEditor.html#setPosition)*/
    cursorPosition?: IPosition;
    /** Scroll vertically as necessary and reveal a line close to the top of the viewport, defaults to `20` (https://microsoft.github.io/monaco-editor/api/interfaces/monaco.editor.IEditor.html#revealLineNearTop) */
    revealLine?: number;
};
export interface IDempProps {
    /** A friendly name for the demo (must be unique) */
    demoName: string;
    /** Playground config */
    config: IPlaygroundConfig;
    /** Github edit URL, should be relative path e.g. `demo-snippets/tutorials/clipping_volumes/box.ts` */
    editUrl: string;
    code: string;
    /** preview image URL for the playground, sample: `assets/demo-screenshots/imageName.png` */
    previewImageUrl?: string;
    /** short description for this demo */
    description?: string;
}

export function demo<T extends string>(
    demoName: T,
    code: string,
    config: IPlaygroundConfig = {},
    desc?: string
): IDemo {
    return {
        [demoName]:
            {
                demoName,
                config: { clickToRun: true, mode: 'inline', canvas2D: false, cursorPosition: { column: 1, lineNumber: 15 }, revealLine: 20, ...config },
                code,
                editUrl: `demo-snippets/tutorials/getting_started/${demoName}.ts`,
                previewImageUrl: `assets/demo-screenshots/${demoName}.png`,
                description: desc || 'No Description Available'
            } as const
    } as const;
}
