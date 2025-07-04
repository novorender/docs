import { type DeviceProfile } from "@novorender/api";
import type { IPosition } from "monaco-editor";

export interface IModule<R = void, P extends any[] = []> {
    main(...props: P): R;
}
export interface DemoHostCtor<T> {
    new (context: IDemoContext): IDemoHost<T>;
}
export interface IDemoHost<T> {
    readonly context: IDemoContext;
    run(cb: (isReady: boolean) => void): void | Promise<void>;
    updateModule(module: T): Promise<void>;
    exit?(): void | Promise<void>;
}

export interface ICanvas {
    readonly primaryCanvas: HTMLCanvasElement;
    readonly canvas2D?: HTMLCanvasElement;
    readonly previewCanvas?: HTMLCanvasElement;
}

export interface IDemoContext<T = any> {
    readonly canvasElements: ICanvas;
    readonly deviceProfile: DeviceProfile;
    reportErrors(...errors: any[]): void;
}

export async function createDemoContext(
    canvasElements: ICanvas,
    reportErrors: (...errors: any[]) => void
): Promise<IDemoContext> {
    // must be imported dynamically to fix SSG build
    const { getDeviceProfile } = await import("@novorender/api");

    const gpuTier = 2; // laptop with reasonably new/powerful GPU.
    const deviceProfile = getDeviceProfile(gpuTier);
    return { canvasElements, deviceProfile, reportErrors };
}

export interface IDempProps {
    /** Directory that contains this demo, e.g. `getting_started/condos.ts`, `getting_started` is the dirName here */
    dirName: string;
    /** Name of the file that contains the demo snippet code */
    fileName: string;
    /** A friendly name for the demo (must be unique) */
    demoName: string;
    /** editor config */
    editorConfig: IEditorConfig;
    /** Github edit URL, should be relative path e.g. `demo-snippets/guides/clipping_volumes/box.ts` */
    editUrl: string;
    /** Code that needs to be in the editor */
    code: string;
    /** preview image URL for the playground, sample: `assets/demo-screenshots/imageName.png` */
    previewImageUrl?: string;
    /** short description for this demo */
    description: string;
    /** Demo host */
    hostCtor: DemoHostCtor<any>;
}

export interface IEditorConfig {
    /** should playground start automatically? defaults to `true` */
    clickToRun?: boolean;
    /** whether to enable a secondary canvas for 2D or not, defaults to `true` */
    canvas2D?: boolean;
    /** whether to enable a third canvas for 2D image preview or not, defaults to `false` */
    enablePreviewCanvas?: boolean;
    /** using `fill` will make the playground to take entire viewport's width and height, `inline` is default */
    mode?: "inline" | "fill";
    /** Set the primary position of the cursor (https://microsoft.github.io/monaco-editor/api/interfaces/monaco.editor.IEditor.html#setPosition)*/
    cursorPosition?: IPosition;
    /** Scroll vertically as necessary and reveal a line close to the top of the viewport (https://microsoft.github.io/monaco-editor/api/interfaces/monaco.editor.IEditor.html#revealLineNearTop) */
    revealLine?: number;
    /** Editor content height in pixels - NOTE: this must be < 260, 260 is the max size of content in inline-editor, after this you get scroll */
    contentHeight?: number;
}

export type IDemo = Record<string, IDempProps>;
