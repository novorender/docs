import { View, createCubeObject, type RenderStateDynamicObject } from "@novorender/api";

export function main(view: View) {
    const { mesh } = createCubeObject();
    const cubeObjectId = 0xf000_0000;
    let scale = 1;

    function update() {
        const scaledCube: RenderStateDynamicObject = {
            mesh,
            instances: [{ position: [0, 0, 0], scale }],
            baseObjectId: cubeObjectId, // dynamic object id
        };
        view.modifyRenderState({
            dynamic: { objects: [scaledCube] },
            // tonemapping: { mode: TonemappingMode.normal },
        });
    }
    update();

    view.canvas.onclick = async (e: MouseEvent) => {
        const result = await view.pick(e.offsetX, e.offsetY);
        if (result && result.objectId == cubeObjectId) {
            scale *= 1.1;
        } else {
            scale /= 1.1;
        }
        update();
    };
}
