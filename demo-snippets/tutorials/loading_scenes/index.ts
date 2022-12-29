import publicScene from '!!./public_scene.ts?raw';
import privateScene from '!!./private_scene.ts?raw';

function demo<T extends string>(name: T, code: string) {
    return {
        [name]:
            {
                demoName: name,
                config: {
                    clickToRun: true,
                },
                editUrl: `demo-snippets/tutorials/loading_scenes/${name}.ts`,
                code: code,
                previewImageUrl: `assets/demo-screenshots/${name}.png`
            } as const
    } as const;
}

export const loadingScenes = {
    ...demo("publicScene", publicScene),
    ...demo("privateScene", privateScene),
};
