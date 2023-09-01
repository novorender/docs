import type { RenderStateDynamicGeometry, RenderStateChanges, RenderStateDynamicMesh, RenderStateDynamicMaterialUnlit, RenderStateDynamicObject } from "@novorender/api";

export async function main(): Promise<RenderStateChanges> {
	// TODO: Get rid of prettier and reformat in a 3x3 layout manually!
	const vertices = new Float32Array([
		0,
		2,
		0, // xyz #0
		-1,
		0,
		0, // xyz #1
		1,
		0,
		0, // xyz #2
	]);
	const geometry: RenderStateDynamicGeometry = {
		primitiveType: "TRIANGLES",
		attributes: { position: { kind: "FLOAT_VEC3", buffer: vertices } },
		indices: 3, // # vertices
	};
	const material: RenderStateDynamicMaterialUnlit = {
		kind: "unlit",
		doubleSided: true,
		baseColorFactor: [0, 1, 0, 1], // green, opaque
	};
	const mesh: RenderStateDynamicMesh = {
		primitives: [{ geometry, material }],
	};
	const triangleObject: RenderStateDynamicObject = {
		mesh,
		instances: [{ position: [0, 0, 0] }],
	};
	return {
		grid: { enabled: true },
		dynamic: { objects: [triangleObject] },
	};
}
