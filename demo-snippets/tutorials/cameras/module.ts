// This file should be imported into the playground
import * as NovoRender from "@novorender/webgl-api";

export interface InitInput {
    readonly canvas: HTMLCanvasElement;
    readonly webglAPI: NovoRender.API;
    readonly view: NovoRender.View;
}

export interface InitOutput {
    readonly controller: NovoRender.CameraController;
}

export interface SnippetModule {
    init(canvas: HTMLCanvasElement, webglAPI: NovoRender.API): NovoRender.CameraController;
}

