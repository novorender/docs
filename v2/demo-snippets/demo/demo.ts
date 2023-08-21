import { DemoHostCtor, IEditorConfig, IDemo } from ".";

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
