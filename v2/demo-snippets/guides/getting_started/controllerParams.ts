import { OrbitController } from "@novorender/api";

export function main(controller: OrbitController) {
	controller.updateParams({
		linearVelocity: 0.1,
		rotationalVelocity: 0.1,
	});
}
