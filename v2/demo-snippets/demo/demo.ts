import { DemoHostCtor, IEditorConfig, IDemo } from ".";

/**
 * @param dirName name of the directory/folder in which the demo file is present
 * @param fileName name of the file that contains the demo snippet code
 * @param demoName a friendly name for the demo
 * @param code string of valid TS code - this is usually the content of {@link fileName}
 * @param hostCtor host class
 * @param config config for demo/editor see {@link IEditorConfig}
 * @param desc some description of demo
 */
export function demo<T extends string>(dirName: string, fileName: string, demoName: T, code: string, hostCtor: DemoHostCtor<any>, config: IEditorConfig = {}, desc?: string): IDemo {
  return {
    [fileName]: {
      dirName,
      fileName,
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
      editUrl: `demo-snippets/guides/${dirName}/${fileName}.ts`,
      previewImageUrl: `/v2/assets/demo-screenshots/${fileName}.png`,
      description: desc || "No Description Available",
    } as const,
  } as const;
}
