import fromPick from '!!./metadata_from_pick.ts?raw';
import fromSearch from '!!./metadata_from_search.ts?raw';
import flyTo from '!!./fly_to.ts?raw';
import { IDemo } from "../../misc";

function demo<T extends string>(name: T, code: string): IDemo {
    return {
        [name]:
            {
                demoName: name,
                config: {
                    clickToRun: true,
                },
                editUrl: `demo-snippets/tutorials/object_metadata/${name}.ts`,
                code: code,
                previewImageUrl: `assets/demo-screenshots/${name}.png`
            } as const
    } as const;
}

export const objectMetadata = {
    ...demo("fromPick", fromPick),
    ...demo("fromSearch", fromSearch),
    ...demo("flyTo", flyTo),
};
