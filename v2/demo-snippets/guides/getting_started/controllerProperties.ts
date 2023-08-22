import { OrbitController } from "@novorender/api";

export function main(controller: OrbitController) {
  controller.fov = 30;
  controller.distance = 30;
}
