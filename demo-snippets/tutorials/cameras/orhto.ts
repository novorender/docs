// ideally a snippet looks like this, while still being type checked against the module interface.
import type * as NovoRender from "@novorender/webgl-api"; // should we only use type imports here and pass everything else as params?
export function init(canvas: HTMLCanvasElement, webglAPI: NovoRender.API) {
  return webglAPI.createCameraController({ kind: "ortho" }, canvas);
}

// Below is an alternative syntax that could be used to enforce module interface, which might be easier to do.
// The import and export const statements should be omitted, leaving only the "inner" parts of the objects to be edited.
// Quite possibly, we could drag in all imports from the snippet.ts file itself, so that everything is already in scope and no import statements needed in the snippet itself.

// import type { SnippetModule } from "./snippet";
// export const snippet: SnippetModule = {
//     init(canvas: HTMLCanvasElement, webglAPI: NovoRender.API) {
//         return webglAPI.createCameraController({ kind: "ortho" }, canvas);
//     }
// };
