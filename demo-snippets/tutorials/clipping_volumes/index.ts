import single from '!!./single.ts?raw';
import offset from '!!./offset.ts?raw';
import flipped from '!!./flipped.ts?raw';
import rotated from '!!./rotated.ts?raw';
import dual from '!!./dual.ts?raw';
import slab from '!!./slab.ts?raw';
import slab_inv from '!!./slab_inv.ts?raw';
import box from '!!./box.ts?raw';

function demo<T extends string>(name: T, code: string) {
    return {
        [name]:
            {
                demoName: name,
                config: {
                    clickToRun: true,
                },
                editUrl: `demo-snippets/tutorials/clipping_volumes/${name}.ts`,
                code: code,
                previewImageUrl: `assets/demo-screenshots/${name}.png`
            } as const
    } as const;
}

export const clippingVolumes = {
    ...demo("single", single),
    ...demo("offset", offset),
    ...demo("flipped", flipped),
    ...demo("rotated", rotated),
    ...demo("dual", dual),
    ...demo("slab", slab),
    ...demo("slab_inv", slab_inv),
    ...demo("box", box),
};
