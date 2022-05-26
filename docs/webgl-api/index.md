---
id: "index"
title: "my-website-001"
slug: "/webgl-api/"
sidebar_label: "Readme"
sidebar_position: 0
custom_edit_url: null
---

<img src="https://novorender.com/wp-content/uploads/2021/06/novorender_logo_RGB_2021.png"/>

# [NovoRender](http://novorender.com/)

> A Web API for scalable 3D rendering in the cloud.

[![Latest NPM Version](https://img.shields.io/npm/v/@novorender/webgl-api.svg?label=@novorender/webgl-api)](https://www.npmjs.com/package/@novorender/webgl-api)  
Build version: 0.3.81  
Build date: Mon, 16 May 2022 11:47:04 GMT  

## Requirements
Novorender requires a modern web browser with [WebGL2](https://get.webgl.org/webgl2/) and
[WebAssembly](https://webassembly.org/) support.<br/>
<img height="64" src="https://www.khronos.org/assets/images/api_logos/webgl.svg"/>
<img height="64" src="https://upload.wikimedia.org/wikipedia/commons/1/1f/WebAssembly_Logo.svg"/>

## Dependencies
For linear algebra (vector and matrix math) we use the [gl-matrix](http://glmatrix.net/) library internally. Colors and 3D vectors are defined as `vec3` types, which equates to a [Float32Arrray](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float32Array) of `length=3`. If all you wish to do is to pass in parameters or read values, you may treat these types a regular array of numbers, i.e. you don't need the gl-matrix library itself for this. If you do wish to perform some linear algebra yourself, however, we recommend you do add it to your own code as well. Just make sure you use same major version as us (^3.3.0) and that you leave the array types to their default values.

## Usage

### ES Module

This example initializes the API directly from our [CDN](https://en.wikipedia.org/wiki/Content_delivery_network) without NPM or bundlers.
The `<script>` tag must be of `type="module"` to allow [ES module](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules) imports.

```javascript
import * as NovoRender from "https://api.novorender.com/scripts/v0.3.81/index.js";
const api = NovoRender.createAPI();
console.log(api.version);
```

### UMD/Global variable

We also provide an [UMD](https://github.com/umdjs/umd) variant of the api on our CDN, which will define the NovoRender namespace as global variable if imported directly in a script tag.

```html
...
<head>
    <script src="https://api.novorender.com/scripts/v0.3.81/index_umd.js"></script>
</head>
...
```

```javascript
/*global NovoRender*/
const api = NovoRender.createAPI();
console.log(api.version);
```

Alternatively, you can use the ES module script and simply assign the namespace to a global variable yourself, like this.
UMD is a legacy module format that we intend to phase out eventually.

But why use a global variable at all?
Unfortunately not all bundlers support native loading of ES modules yet, so you may have to work around this limitation using a global variable for now.
See below for more details.

```html
...
<head>
    <script type="module">
        import * as NovoRender from "https://api.novorender.com/scripts/v0.3.81/index.js";
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

## Installation

NovoRender is also available as an [NPM](https://www.npmjs.com/package/@novorender/webgl-api) package. You can install NovoRender in your project's directory with npm:

```bash
$ npm install @novorender/webgl-api
```

For bleeding edge builds:

```bash
$ npm install @novorender/webgl-api@next
```

The package contains pre-bundled ES6 and UMD modules and typescript definition file that you can use for both local development and include in your web deployment.

> Please note that many popular bundlers still don't have first class support for web workers and dynamic loading of native ES6 modules in the browser.
As such, the current version may not work without some additional configuration, like jQuery or lodash when loaded from a CDN.
This typically involves declaring NovoRender as some external dependency that you must provide yourself through a `<script>` tag in your HTML file and a global namespace variable like in the UMD example above.

- Webpack: [externals](https://webpack.js.org/configuration/externals/)
- Rollup: [external](https://rollupjs.org/guide/en/#external).
- Parcel V2: [externals](https://v2.parceljs.org/features/module-resolution#externals)
- Browserify: [browserify-shim](https://github.com/thlorenz/browserify-shim)

Whether you load the NovoRender module from our CDN or your local web server, the `index.js` or `index_umd.js` script expects to find the two worker scripts, `render.js` and `geometry.js`, in the same folder as itself.
Note that the worker scripts aren't loaded until you create your first view. If all you intend to do is to work with metadata, you may not even need them.

The example below creates a view and a demo scene containing a simple cube.
It uses [typescript](https://www.typescriptlang.org/), but vanilla ECMAScript is of course also supported.
The API itself is built with typescript, as are several of our examples.
Even our documentation uses typescript type notations, which should still be understandable for most javascript programmers.
If your project allows it, we recommend using typescript for your own code as well.

```typescript
import * as NovoRender from "@novorender/webgl-api";
const canvas = document.getElementById("output_canvas") as HTMLCanvasElement;
const api = NovoRender.createAPI();
const view = await api.createView(canvas);
view.scene = await api.loadScene(NovoRender.WellKnownSceneUrls.cube);
```

The canvas element itself may be transferred to a web worker, in which case it becomes unavailable to the main script.
For this and other reasons, our engine observes the size of your canvas's parent element using a [ResizeObserver](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver).
Whenever the parent size changes, the canvas, internal render buffers and camera aspect ratio are automatically adjusted to fill the entire internal area of parent element.

```html
<div style="width:400px; height:300px;">
    <canvas id="output_canvas" style="width:100%; height:100%"></canvas>
</div>
```

## Next steps

While you probably will want to delve into uploading your own CAD models and integrating object selection and highlighting with your internal metadata and databases eventually, you may want to tinker with camera controllers and render settings first.
Building upon our previous typescript example, we'll add a different background color and turntable camera controller to make the cube spin.

```typescript
...
const api = NovoRender.createAPI();
const view = await api.createView(canvas, { background: { color: [0, 0, 0.25, 1] }});
view.scene = await api.loadScene(NovoRender.WellKnownSceneUrls.cube);
view.camera.controller = api.createCameraController({ kind: "turntable" });
```

If everything went well, you should see [this](https://api.novorender.com/demos/spinning_cube.html).

What about an interactive camera controller?
Just change the kind of controller and specify the HTML DOM element from which you want the controller to get its input, like touch, keyboard and mouse events from.

```typescript
...
view.camera.controller = api.createCameraController({ kind: "flight"}, canvas);

```
You may want to try other camera controllers and demo scenes as well before you start uploading your own CAD files.

## Further information

For more detailed documentation, please visit [api.novorender.com](https://api.novorender.com/docs/v0.3.81/index.html).

For examples, please visit our public [github](https://github.com/novorender/novorender-examples) repository.
