export type IDemo = Record<string, {
    /** A friendly name for the demo */
    demoName: string,
    config: {
        /** should playground start automatically? defaults to `true` */
        clickToRun?: boolean;
        /** whether to enable a secondary canvas for 2D or not, defaults to `false` */
        canvas2D?: boolean;
    },
    /** Github edit URL, should be relative path e.g. `demo-snippets/tutorials/clipping_volumes/box.ts` */
    editUrl: string,
    code: string,
    snippet: string,
    /** preview image URL for the playground, sample: `assets/demo-screenshots/imageName.png` */
    previewImageUrl?: string;
}>;