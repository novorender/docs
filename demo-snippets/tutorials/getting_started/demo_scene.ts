import { WellKnownSceneUrls, API } from "@novorender/webgl-api";

export async function main(api: API, canvas: HTMLCanvasElement) {
    // create a view
    const view = await api.createView(
      { background: { color: [0, 0, 0, 0] } }, // transparent
      canvas
    );
  
    // provide a camera controller
    view.camera.controller = api.createCameraController({ kind: "turntable" });
  
    // load the Condos demo scene
    view.scene = await api.loadScene(WellKnownSceneUrls.condos);
  
    // create a bitmap context to display render output
    const ctx = canvas.getContext("bitmaprenderer");
  
    // main render loop
    while (true) {
      // handle canvas resizes
      const { clientWidth, clientHeight } = canvas;
      view.applySettings({
        display: { width: clientWidth, height: clientHeight },
      });
  
      // render frame
      const output = await view.render();
      {
        // finalize output image
        const image = await output.getImage();
        if (image) {
          // display in canvas
          ctx?.transferFromImageBitmap(image);
          image.close();
        }
      }
    }
  }
