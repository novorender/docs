import demo1 from '!!./demo1.ts?raw';
import { IDemo } from "../../misc";

function demo<T extends string>(name: T, code: string): IDemo {
    return {
        [name]:
            {
                demoName: name,
                config: {
                    clickToRun: true,
                },
                editUrl: `demo-snippets/tutorials/measure/${name}.ts`,
                code: code,
                previewImageUrl: `assets/demo-screenshots/${name}.png`
            } as const
    } as const;
}

export const measure = {
    ...demo("parametricMeasure", demo1),
};
