import { type OrbitController } from "@novorender/api";

export function main(controller: OrbitController) {
    // reduce both linear and rotational speed to 10%.
    controller.updateParams({
        linearVelocity: 0.1,
        rotationalVelocity: 0.1,
    });
}
