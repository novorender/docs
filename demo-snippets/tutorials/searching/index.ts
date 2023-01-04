import searchingDemo from '!!./searching.ts?raw';
import { IDemo } from "../../misc";

function demo<T extends string>(name: T, code: string): IDemo {
    return {
        [name]:
            {
                demoName: name,
                config: {
                    clickToRun: true
                },
                editUrl: `demo-snippets/tutorials/searching/${name}.ts`,
                code: code,
                previewImageUrl: `assets/demo-screenshots/${name}.png`
            } as const
    } as const;
}

export const searching = {
    ...demo("searching", searchingDemo),
};
