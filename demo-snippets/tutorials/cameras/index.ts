
import pinhole from '!!./pinhole.ts?raw';
import ortho from '!!./ortho.ts?raw';
import main from '!!./main.ts?raw';
import { IDemo } from "../../misc";

function demo<T extends string>(name: T, code: string, snippet: string): IDemo {
    return {
        [name]:
            {
                demoName: name,
                config: {
                    clickToRun: true,
                },
                editUrl: `demo-snippets/tutorials/cameras/${name}.ts`,
                code: code,
                snippet: snippet,
                previewImageUrl: `assets/demo-screenshots/${name}.png`
            } as const
        // TODO: Add these to IDemo interface
        // run, 
        // moduleInterface
    } as const;
}

export const cameras = {
    ...demo("pinhole", pinhole, main),
    ...demo("ortho", ortho, main),
};
