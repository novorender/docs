import pick from '!!./pick.ts?raw';
import { IDemo } from "../../misc";

function demo<T extends string>(name: T, code: string): IDemo {
    return {
        [name]:
            {
                demoName: name,
                config: {
                    clickToRun: true,
                },
                editUrl: `demo-snippets/tutorials/object_selection/${name}.ts`,
                code: code,
                previewImageUrl: `assets/demo-screenshots/${name}.png`
            } as const
    } as const;
}

export const objectSelection = {
    ...demo("pick", pick),
};
