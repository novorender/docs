import demo1 from '!!./demo1.ts?raw';

function demo<T extends string>(name: T, code: string) {
    return {
        [name]:
            {
                demoName: "dynamic-objects", // this is really more of an image url thing
                config: {
                    clickToRun: true,
                },
                editUrl: `demo-snippets/tutorials/dynamic_objects/${name}.ts`,
                code: code,
                previewImageUrl: 'assets/demo-screenshots/simple-cube.jpg'
            } as const
    } as const;
}

export const dynamicObjects = {
    ...demo("demo1", demo1),
};
