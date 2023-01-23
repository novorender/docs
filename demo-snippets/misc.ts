export type IDemo = Record<string, IDempProps>;

export interface IDempProps {
    /** A friendly name for the demo (must be unique) */
    demoName: string;
    config: {
        /** should playground start automatically? defaults to `true` */
        clickToRun?: boolean;
        /** whether to enable a secondary canvas for 2D or not, defaults to `false` */
        canvas2D?: boolean;
        /** using `fill` will make the playground to take entire viewport's width and height, `inline` is default */
        mode?: 'inline' | 'fill';
    },
    /** Github edit URL, should be relative path e.g. `demo-snippets/tutorials/clipping_volumes/box.ts` */
    editUrl: string;
    code: string;
    /** preview image URL for the playground, sample: `assets/demo-screenshots/imageName.png` */
    previewImageUrl?: string;
    /** short description for this demo */
    description?: string;
}

export function demo<T extends string>(name: T, code: string, desc?:string): IDemo {
    return {
        [name]:
            {
                demoName: name,
                config: {
                    clickToRun: true,
                },
                editUrl: `demo-snippets/tutorials/getting_started/${name}.ts`,
                code: code,
                previewImageUrl: `assets/demo-screenshots/${name}.png`,
                description: desc || 'No Description Available'
            } as const
    } as const;
}
