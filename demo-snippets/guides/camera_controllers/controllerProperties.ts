import { type OrbitController } from "@novorender/api";

export function main(controller: OrbitController) {
    // narrow the field of view and increase the distance
    controller.fov = 30;
    controller.distance = 30;
}
