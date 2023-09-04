import { type View } from "@novorender/api";

export function main(view: View) {
    view.canvas.onclick = async (e: MouseEvent) => {
        const result = await view.pick(e.offsetX, e.offsetY);
        if (result) {
            alert(`You picked object id:${result.objectId}`);
        }
    };
}
