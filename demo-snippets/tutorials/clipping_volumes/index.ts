import single from '!!./single.ts?raw';
import offset from '!!./offset.ts?raw';
import flipped from '!!./flipped.ts?raw';
import rotated from '!!./rotated.ts?raw';
import dual from '!!./dual.ts?raw';
import slab from '!!./slab.ts?raw';
import slab_inv from '!!./slab_inv.ts?raw';
import box from '!!./box.ts?raw';
import { demo } from "../../misc";

export const clippingVolumes = {
    ...demo("clipping_volumes", "single", single, {}, 'Simple clipping volume with a single plane along the yz axes, effectively clipping everything to the right of center.'),
    ...demo("clipping_volumes", "offset", offset, {}, 'We used the center of the scene (which is far from origo) to position the plane.'),
    ...demo("clipping_volumes", "flipped", flipped, {}, 'Flipping the plane by flipping the direction of the normal.'),
    ...demo("clipping_volumes", "rotated", rotated, {}, 'Single plane, rotated.'),
    ...demo("clipping_volumes", "dual", dual, {}, 'More complex clipping volume with an additional plane along the xz axes, effectively clipping everything to the right and above center.'),
    ...demo("clipping_volumes", "slab", slab, {}, 'A perhaps more useful volume is a slab, consisting of a top and bottom plane, but otherwise extending into infinity.'),
    ...demo("clipping_volumes", "slab_inv", slab_inv, {}, 'Clip everything inside of the volume, rather than outside, simply flip the planes (negate all elements) and change the combination mode.'),
    ...demo("clipping_volumes", "box", box, {}, 'Axis aligned clipping box.'),
};
