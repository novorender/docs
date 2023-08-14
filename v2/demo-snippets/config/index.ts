import { Core3DImports, DeviceProfile, RenderStateChanges, getDeviceProfile, Core3DImportMap, downloadImports } from "@novorender/api";
// @ts-expect-error
import { shaders } from "@novorender/api/public/shaders";
import type { IPosition } from "monaco-editor";

export interface IModule {
  main(): RenderStateChanges;
}
export interface DemoHostCtor<T> {
  new (context: IDemoContext): IDemoHost<T>;
}
export interface IDemoHost<T> {
  run(): Promise<void>;
  updateModule(module: T): string | undefined; // return potential error from validation
  exit(): void;
}

interface ICanvas {
  primaryCanvas: HTMLCanvasElement;
  canvas2D?: HTMLCanvasElement;
  previewCanvas?: HTMLCanvasElement;
}
export interface IDemoContext<T = any> {
  readonly canvasElements: ICanvas;
  readonly deviceProfile: DeviceProfile;
  readonly imports: Core3DImports;
}

/** Core imports, you can provide your own to `createDemoContext` if want */
export let coreImportsPromise: Promise<Core3DImports>;
// for fixing docusaurus build
if (typeof window !== "undefined") {
  const baseUrl = new URL(".", window.location.origin + "/v2/");
  const coreImportsMap: Core3DImportMap = { baseUrl, shaders };
  coreImportsPromise = downloadImports(coreImportsMap);
}

export async function createDemoContext(canvasElements: ICanvas, importsPromise: Promise<Core3DImports> = coreImportsPromise): Promise<IDemoContext> {
  const gpuTier = 2; // laptop with reasonably new/powerful GPU.
  const deviceProfile = getDeviceProfile(gpuTier);
  const imports = await importsPromise;
  return { canvasElements, deviceProfile, imports };
}

export interface IDempProps {
  /** Directory that contains this demo, e.g. `getting_started/condos.ts`, `getting_started` is the dirName here */
  dirName: string;
  /** A friendly name for the demo (must be unique) */
  demoName: string;
  /** editor config */
  editorConfig: IEditorConfig;
  /** Github edit URL, should be relative path e.g. `demo-snippets/tutorials/clipping_volumes/box.ts` */
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
}

export type IDemo = Record<string, IDempProps>;

export function demo<T extends string>(dirName: string, demoName: T, code: string, hostCtor: DemoHostCtor<any>, config: IEditorConfig = {}, desc?: string): IDemo {
  return {
    [demoName]: {
      dirName,
      demoName,
      editorConfig: {
        clickToRun: true,
        mode: "inline",
        canvas2D: true,
        enablePreviewCanvas: false,
        ...config,
      },
      hostCtor,
      code,
      editUrl: `demo-snippets/tutorials/${dirName}/${demoName}.ts`,
      previewImageUrl: `/assets/demo-screenshots/${demoName}.png`,
      description: desc || "No Description Available",
    } as const,
  } as const;
}
