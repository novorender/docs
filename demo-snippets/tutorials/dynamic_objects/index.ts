import demo1 from '!!./demo1.ts?raw';

function demo<T extends string>(name: T, code: string) {
    return {
        [name]:
            {
                demoName: name,
                config: {
                    clickToRun: true,
                },
                editUrl: `demo-snippets/tutorials/dynamic_objects/${name}.ts`,
                code: code,
                previewImageUrl: 'assets/demo-screenshots/box.png'
            } as const
    } as const;
}

export const dynamicObjects = {
    ...demo("demo1", demo1),
};
