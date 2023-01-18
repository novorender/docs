import demo1 from '!!./demo1.ts?raw';
import { IDemo } from "../../misc";

function demo<T extends string>(name: T, code: string): IDemo {
    return {
        [name]:
            {
                demoName: name,
                config: {
                    clickToRun: true,
                    canvas2D: true // 2DCanvas overlay
                },
                editUrl: `demo-snippets/tutorials/drawing2D/${name}.ts`,
                code: code,
                previewImageUrl: `assets/demo-screenshots/${name}.png`,
            } as const
    } as const;
}

export const drawing2D = {
    ...demo("drawing2d", demo1),
};
