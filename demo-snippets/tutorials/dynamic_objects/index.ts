import demo1 from '!!./demo1.ts?raw';

function demo<T extends string>(name: T, code: string) {
    return {
        [name]:
            {
                demoName: "dynamic-objects", // this is really more of an image url thing
                config: {
                    useManagedRenderer: false,
                    clickToRun: true,
                },
                editUrl: `demo-snippets/tutorials/dynamic_objects/${name}.ts`,
                children: code,
            } as const
    } as const;
}

export const dynamicObjects = {
    ...demo("demo1", demo1),
};
