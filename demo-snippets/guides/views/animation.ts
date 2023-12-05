import { View } from "@novorender/api";

export function main(view: View) {
    view.animate = (time: number) => {
        const t = Math.sin(time / 1000) * .5 + .5;
        view.modifyRenderState({ background: { color: [t, t, t] } });
    };
}
