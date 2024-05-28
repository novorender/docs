import { View, type RecursivePartial, type RenderStateClipping } from "@novorender/api";
import { vec3 } from "gl-matrix";

export function main(centerX: number, centerY: number, centerZ: number, view: View): RecursivePartial<RenderStateClipping> {

    view.canvas.onclick = async (e: MouseEvent) => {
        const result = await view.pick(e.offsetX, e.offsetY);
        if (result) {
            if (result.sampleType === "surface") {
                view.modifyRenderState({
                    clipping: {
                        enabled: true,
                        planes: [{
                            normalOffset: [...result.normal, vec3.dot(result.normal, result.position)]
                        }]
                    }
                });
            }
            else {
                console.log("A planar surface was not selected");
            }
        }
    };

    return {};
}
