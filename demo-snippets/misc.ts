export type IDemo = Record<string, {
    /** A friendly name for the demo (must be unique) */
    demoName: string,
    config: {
        /** should playground start automatically? defaults to `true` */
        clickToRun?: boolean;
        /** whether to enable a secondary canvas for 2D or not, defaults to `false` */
        canvas2D?: boolean;
        /** using `fill` will make the playground to take entire viewport's width and height, `inline` is default */
        mode?: 'inline' | 'fill';
    },
    /** Github edit URL, should be relative path e.g. `demo-snippets/tutorials/clipping_volumes/box.ts` */
    editUrl: string,
    code: string,
    /** preview image URL for the playground, sample: `assets/demo-screenshots/imageName.png` */
    previewImageUrl?: string;
}>;