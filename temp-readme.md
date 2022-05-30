# A Web API for scalable 3D rendering in the cloud

This API implements a complete engine for rendering Novorender 3D assets in the browser. It is designed from scratch without the use of existing 3D engines to be as performant and streamlined as possible. The main goal is to visualize the assets we host in the ways typically requested by our customers, not to offer a generic 3D rendering platform.

## Requirements

This API requires a modern web browser with [WebGL2](https://get.webgl.org/webgl2/) and
[WebAssembly](https://webassembly.org/) support.

<img height="64px" src="https://www.khronos.org/assets/images/api_logos/webgl.svg"/>
<img height="64px" src="https://upload.wikimedia.org/wikipedia/commons/1/1f/WebAssembly_Logo.svg"/>

## Dependencies

For linear algebra (vector and matrix math) we use the [gl-matrix](http://glmatrix.net/) library internally. Colors and 3D vectors are defined as `vec3` types, which equates to a array of `length=3`. If all you wish to do is to pass in parameters or read values, you may treat these types a regular array of numbers, i.e. you don't need the gl-matrix library itself for this. If you do wish to perform some linear algebra yourself, however, we recommend you do add it to your own code as well. Just make sure you use same major version as us. Also note that we use Array instead of Float32Array for vector types, since this is more performant on most modern browsers: `glMatrix.setMatrixArrayType(Array);`

## Usage

For ease of use and build speed, we've pre-bundled the API into browser friendly modules, one for each of the workers and one file for the wasm code. You can either include the scripts directly or import them using your favorite bundler.

### ES Module

This example initializes the API directly from our [CDN](https://en.wikipedia.org/wiki/Content_delivery_network) without NPM or bundlers.
The `<script>` tag must be of `type="module"` to allow [ES module](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules) imports.

```javascript
import * as NovoRender from "https://api.novorender.com/scripts/v0.3.93/index.js";
const api = NovoRender.createAPI();
console.log(api.version);
```

### UMD/Global variable

We also provide an [UMD](https://github.com/umdjs/umd) variant of the api on our CDN, which will define the NovoRender namespace as global variable if imported directly in a script tag.

```html
...
<head>
    <script src="https://api.novorender.com/scripts/v0.3.93/index_umd.js"></script>
</head>
...
```

```javascript
/*global NovoRender*/
const api = NovoRender.createAPI();
console.log(api.version);
```

Alternatively, you can use the ES module script and simply assign the namespace to a global variable yourself, like this. UMD is a legacy module format that we intend to phase out eventually.

But why use a global variable at all?
Unfortunately not all bundlers support native loading of ES modules yet, so you may have to work around this limitation using a global variable for now.
See below for more details.

```html
...
<head>
    <script type="module">
        import * as NovoRender from "https://api.novorender.com/scripts/v0.3.93/index.js";
        self.NovoRender = NovoRender;
    </script>
</head>
...
```

If using this technique with typescript, you may want to declare the global variable in some project .d.ts file and install the npm package, if for no other reason than its type definitions.

```typescript
declare global {
    const NovoRender: typeof import("@novorender/webgl-api");
}
```

Or, if you prefer, add this line to each file (typically just one) that references the NovoRender namespace instead:

```typescript
declare const NovoRender: typeof import("@novorender/webgl-api");
```

### NPM Module

NovoRender is also available as an [NPM](https://www.npmjs.com/package/@novorender/webgl-api) package. You can install NovoRender in your project's directory with npm:

```bash
npm install @novorender/webgl-api
```

For bleeding edge builds:

```bash
npm install @novorender/webgl-api@next
```

The package contains pre-bundled ES6 and UMD modules and typescript definition file that you can use for both local development and include in your web deployment.

> Please note that many popular bundlers still don't have first class support for web workers and dynamic loading of native ES6 modules in the browser. As such, the current version may not work without some additional configuration, like jQuery or lodash when loaded from a CDN. This typically involves declaring NovoRender as some external dependency that you must provide yourself through a `<script>` tag in your HTML file and a global namespace variable like in the UMD example above.

- Webpack: [externals](https://webpack.js.org/configuration/externals/)
- Rollup: [external](https://rollupjs.org/guide/en/#external).
- Parcel V2: [externals](https://v2.parceljs.org/features/module-resolution#externals)
- Browserify: [browserify-shim](https://github.com/thlorenz/browserify-shim)

Whether you load the NovoRender module from our CDN or your local web server, the `index.js` or `index_umd.js` script expects to find the two worker scripts, `render.js` and `geometry.js`, in the same folder as itself. Note that the worker scripts aren't loaded until you create your first view. If all you intend to do is to work with metadata, you may not even need them.

The example below creates a view and a demo scene containing a simple cube. It uses [typescript](https://www.typescriptlang.org/), but vanilla ECMAScript is of course also supported. The API itself is built with typescript, as are several of our examples. Even our documentation uses typescript type notations, which should still be understandable for most javascript programmers. If your project allows it, we recommend using typescript for your own code as well.

```typescript
import * as NovoRender from "@novorender/webgl-api";
const canvas = document.getElementById("output_canvas") as HTMLCanvasElement;
const api = NovoRender.createAPI();
const view = await api.createView({}, canvas);
view.scene = await api.loadScene(NovoRender.WellKnownSceneUrls.cube);
```

> Please note that on browsers that support [OffscreenCanvas](https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas), you can omit the canvas argument in `createView()` and explicitly copy the image to your canvas via [ImageBitmapRenderingContext.transferFromImageBitmap()](https://developer.mozilla.org/en-US/docs/Web/API/ImageBitmapRenderingContext/transferFromImageBitmap) for better performance and control.

## Render loop

Great, so we've initialized the api, loaded a scene and created a view. Now all that remains is to actually render something on screen. To enable custom pipelines of post effects and compositing/synchronizing with 2D content, such as SVG or CanvasRenderingContext2D, we've introduced a render loop. Such loops are not common in browser javascript, but since it has at least one async method, it won't time out or behave badly. Here is the smallest possible example.

```typescript
for (; ;) {
    const output = await view.render();
    await output.getImage();
}
```

To save energy, the `render()` function will not return until something in the rendered image has changed, and at most once per [animation frame](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame). To handle canvas resizes, you should set the display width and height render settings before rendering. Since the canvas size is in actual pixels, not CSS "pixels", you may want to include `devicePixelRatio` like this:

```typescript
for (; ;) {
    // handle resizes    
    const { clientWidth, clientHeight } = canvas;
    const width = clientWidth * devicePixelRatio;
    const height = clientHeight * devicePixelRatio;
    view.applySettings({ display: { width, height } });

    const output = await view.render();
    await output.getImage();
}
```

The `view.render()` function returns an render output object that you can use for post processes and 2D compositing.
Although currently not required, we recommend you call `dispose()` on this object once you're done with it.

```typescript
let runMyRenderLoop = true;
while (runMyRenderLoop) {
    // handle resizes    
    const { clientWidth, clientHeight } = canvas;
    const width = clientWidth * devicePixelRatio;
    const height = clientHeight * devicePixelRatio;
    view.applySettings({ display: { width, height } });

    const output = await view.render();
    output.applyPostEffect({kind:"gs"}); // make image gray scale
    // do other post effects and 2D compositing here...
    await renderOutput.getImage();

}
```

You may also find that other things are better done in the render loop than in e.g. event handlers directly, such as recreating the view. In that case, just set some boolean flag in the handler and add an `if` statement in the render loop to handle it there. You probably also want to add a clean exit instead of running an infinite loop, like the while loop above.

## Next steps

While you probably will want to delve into uploading your own CAD models and integrating object selection and highlighting with your internal metadata and databases eventually, you may want to tinker with camera controllers and render settings first. Building upon our previous typescript example, we'll add a different background color and turntable camera controller to make the cube spin.

```typescript
const api = NovoRender.createAPI();
const view = await api.createView(canvas, { background: { color: [0, 0, 0.25, 1] }});
view.scene = await api.loadScene(NovoRender.WellKnownSceneUrls.cube);
view.camera.controller = api.createCameraController({ kind: "turntable" });
```

If everything went well, you should see [this](https://api.novorender.com/demos/spinning_cube.html).

What about an interactive camera controller?
Just change the kind of controller and specify the HTML DOM element from which you want the controller to get its input, like touch, keyboard and mouse events from.

```typescript
view.camera.controller = api.createCameraController({ kind: "flight"}, canvas);
```

You may want to try other camera controllers and demo scenes as well before you start uploading your own CAD files.
