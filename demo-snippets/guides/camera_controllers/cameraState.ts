import { type View } from "@novorender/api";

export function main(view: View) {
    view.switchCameraController("null"); // disable camera controller
    view.modifyRenderState({ grid: { enabled: true } }); // enable grid

    // set camera state manually
    const position = [0, 0, 10];
    const rotation = [0, 0, 0, 1];
    const kind = "pinhole"; // perspective projection
    const fov = 60; // field of view in degrees
    view.modifyRenderState({
        camera: { kind, position, rotation, fov },
    });
}
