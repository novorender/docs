import { OrbitController } from "@novorender/api";

export function main(controller: OrbitController) {
  controller.updateParams({
    linearVelocity: 0.5,
    rotationalVelocity: 0.5,
  });
}
