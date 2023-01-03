import floors from '!!./floors.ts?raw';
import create from '!!./create.ts?raw';

function demo<T extends string>(name: T, code: string) {
    return {
        [name]:
            {
                demoName: name,
                config: {
                    clickToRun: true,
                },
                editUrl: `demo-snippets/tutorials/object_groups/${name}.ts`,
                code: code,
                previewImageUrl: `assets/demo-screenshots/${name}.png`
            } as const
    } as const;
}

export const objectGroups = {
    ...demo("floors", floors),
    ...demo("create", create),
};
