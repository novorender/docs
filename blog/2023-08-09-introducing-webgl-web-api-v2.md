---
title: Introducing Novorender WebGL Web API V2
description: Novorender WebGL Web API V2.
slug: webgl-web-api-v2
authors: tl
tags: [novorender, webgl2]
hide_table_of_contents: false
---

# New API release

After months of hard work and testing we're excited to announce that our new render API is finally out! We pretty much rewrote our rendering engine from scratch. Combining the best parts of the past with some radical new changes, we got rid of technical debt and simplified our codebase. In the process we also added some powerful new features and a way of thinking that we think you'll appreciate.
<!--truncate-->

## Open source

No documentation is better than the actual source code. This is why we made the [github repo](https://github.com/novorender/ts) public, with warts and all. This contains all the API code used for web clients, such as our [Novoweb viewer app](https://github.com/novorender/novoweb).

The [NPM package](https://www.npmjs.com/package/@novorender/api) contains type declarations and a javascript bundle, with source mapping directly the typescript source code. Hopefully, this will make it even easier for you to navigate and inspect our API to your heart's content.

We're also hosting our code in a monorepo, instead of different APIs. These are now modules, or sub-folders within this repo. Thus we hope to ensure that versions stay in sync as well as ease of deployment and navigation. If you don't want the cost of a single bundle with all the APIs included, we do encourage consuming our APIs directly from our typescript source code, using tree shaking and code splitting in your own app bundle to bring only what you need. Tools like [esbuild](https://esbuild.github.io/) are blazing fast, making this a highly viable option.

## Geometry filtering

While we could always hide objects, they remain in memory, nonetheless. Hidden geometry also comes at a performance cost, albeit smaller than if actually rendered.

In this version you can filter out objects completely, saving memory and improving rendering performance as if they weren't there in the first place! Better yet, with our dynamic level of detail streaming, you get to spend those freed-up resources on details of the geometry you do care about. On mobile devices in particular, this is a game changer.

Our customers can now model varying niche aspects of their projects in much greater detail, such as reinforcing bars or electrical wiring. Users may simply filter away anything they don't care about by picking from a list of pre-curated filters. Since these filters are also 100% dynamic, they can also create their own or modify existing ones - live, on any device!

Changing filters will force a reload of the scene, which may take several seconds, depending on your bandwidth. Hiding has no such drawback, so you can hide the objects while you're working on the set. Once complete, you can change it to filter mode for the best of both worlds.

## Procedural geometry

The ability to stream large scenes is great, but it's still static geometry. Previously you could load [glTF](https://www.khronos.org/gltf/) models and render them at dynamic position and rotation. This can be useful for 3D UI widgets and markers. It can also be used for visualizing the live location of equipment etc. We called these dynamic objects.

Now you can generate these objects yourself, in your own javascript code. Want to make a 3D arrow? Just go ahead and tesselate one yourself using a cylinder and a cone. Want to reshape it dynamically? Re-tesselate with new parameters! You can also change the material, complete with a rich set of textures and physically based properties available to glTF models.

![Procedural Spheres](/img/spheres.jpg)
*Random instances of a procedurally generated sphere.*

Except for loading glTF files and a some basic helper functions for tutorials, we don't provide any library to help generate geometry. There are several third party libraries, however. [JSCAD](https://openjscad.xyz/docs/index.html) in particular may be worth a look if you plan on generating complex procedural geometry. We may provide an adapter for their API in the future.

One last thing worth mentioning is that the instances of dynamic objects are now rendered using [GPU instancing](https://learnopengl.com/Advanced-OpenGL/Instancing). As long as the total triangle count remains manageable (~1 million), the overhead per instance is very low, allowing you to render tens of thousands of instances with ease.

> Unlike static geometry, procedural geometry is not streamed or rendered with [level of detail](https://en.wikipedia.org/wiki/Level_of_detail_(computer_graphics)). Consequently, it doesn't scale nearly as well, so use with moderation!

## Extensibility

Unhappy with our existing camera controllers? Why not make your own? You can make one from scratch or inherit from our existing classes and override to achieve pretty much any behavior with little effort.

How about your own post-effect or custom 3D renderer? Our new engine is designed around a concept of render modules that each interact with the render context independently. You can make your own from scratch, complete with shaders, or use third party engines like [three.js](https://threejs.org/). You may also avail of the WebGL2 abstraction layer we use internally for a decent tradeoff between performance and complexity.

You can also do 2D compositing. Make your own View class that inherits from ours and override the animate() and render() methods to introduce your own 2D elements, such as text, images and lines. By choosing a transparent background color, you can also composite the rendered 3D output into your own 2D context.

Finally, you may override and adjust the performance auto scale features to better suit your overall app, either by extending our View class or making your own. Our multi-layered architecture give you several choices between ease of use and detailed control.

Of course, you may also rebuild our API from scratch and make any changes you like. Suggestions and pull requests are welcome as our API saga remains a work in progress!

## Miscellaneous

Aided by experience and the general progress of browsers we made several improvements to our architecture. While there are many breaking changes, they also allowed us to right many prior mistakes and rid ourselves of technical debt.

### Render state

The output image is now fully defined by a single, immutable render state object. Changes are consistently done by [read-copy-update](https://en.wikipedia.org/wiki/Read-copy-update) shallow copies, in a truly functional style of programming. This makes it a lot easier to reason about the code and makes detecting changes simpler and more performant. It also adds some interesting options, such as the ability to serialize this state as JSON for reproduction in e.g. bug reports, undo/redo/history features, or server rendering.

### WebGL 2

As the Safari browser now finally supports WebGL2 properly, we were able to make several technical improvements, some of which are listed here:

- Significant reduction of geometry format and overall memory footprint. Most devices are no longer limited by memory, but by rendering performance.
- Multi-sample anti aliasing ([MSAA](https://en.wikipedia.org/wiki/Multisample_anti-aliasing)) improves looks. It also allows us to use [alpha to coverage](https://en.wikipedia.org/wiki/Alpha_to_coverage) transparency, which is more flexible and performant than regular alpha blending, and more visually pleasing than dithered transparency.
- Proper clipping plane outline rendering using [transform feedback](https://open.gl/feedback).
- Improved performance using [vertex array objects](https://en.wikipedia.org/wiki/Vertex_buffer_object), [uniform buffer objects](https://www.khronos.org/opengl/wiki/Uniform_Buffer_Object) for rendering.
- Async, non-stalling, frame buffer reads using [pixel buffer objects](https://www.khronos.org/opengl/wiki/Pixel_Buffer_Object) and with [fence sync object](https://www.khronos.org/opengl/wiki/Sync_Object#Fence) for stutter-free depth sampling and measurement cursor hovering.
- On-the-fly recompilation of shaders using [parallel shader compilation](https://developer.mozilla.org/en-US/docs/Web/API/KHR_parallel_shader_compile) to not pay for what you don't use, e.g. clipping.
- The max # of selectable objects is increased from ~24 million to ~4 billion by using shader integers.

### Bundling, Web workers and WASM

We use [web workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers), most notably for geometry streaming and offline support. The Safari browser holds us back, however. Years after chrome first introduced it, Safari still doesn't implement 3D rendering in OffscreenCanvas! Also, most browsers on most platforms these days uses [angle](https://en.wikipedia.org/wiki/ANGLE_(software)), which does the rendering in a separate process. This means there is little point to the extra complexity of having a separate render worker. Consequently, we moved rendering back into the main thread, which allowed us to greatly simplify the code. Combined with going open source, this also finally made supporting third party render modules a viable option.

To make life easier for the users of our API, we've endeavored to bundle everything into a single script, inlining every resource. This would have made deployment with legacy bundlers and uses in code sandbox and stackblitz a lot easier. There are complications, however. Some newer javascript API's, such as [SharedArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer), requires special HTTP headers for cross-domain isolation due to security concerns. [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API), which is required for offline support, *MUST* be in a separate script file. Eventually we had to abandon the quest to fit into the classical NPM package mould. Our API is simply too advanced.

Thankfully, most bundlers are finally supporting [ESM](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules) properly. Hence, we dropped support for legacy UMD. [Vite](https://vitejs.dev/) supports code splitting for [web workers](https://vitejs.dev/guide/features.html#web-workers) and [web assembly](https://vitejs.dev/guide/features.html#webassembly) out of the box. Embracing this future, we opted for a more complicated, but flexible deployment scheme that should fit most bundlers, albeit with a little effort. Instead of shielding the users of our API from this complexity, we now aim to explain and offer options instead.

We currently use [web assembly](https://developer.mozilla.org/en-US/docs/WebAssembly) for math operations. Limitations on what memory can be shared between javascript and web assembly severely limits its utility for many other cases. Once the proposal for [garbage collection](https://github.com/WebAssembly/gc) is supported in the major browsers, we aim to use it a lot more, particularly for memory intensive operations, such as parsing, object culling and geometry tesselation. A full out web assembly rendering engine is also in the cards, particularly if web assembly is able to call directly into browser APIs, such as WebGL2 and WebGPU.

## The road ahead

These are some of the features we're currently working on or have on our radar in the near future.

### Offline support

Not all construction projects are blessed with a good 5G connection, so next in our pipeline is offline support. This will start out pretty basic and evolve with more advanced features for pre-filtering and selecting an *area of interest* over time. Again, Safari throws a spanner in the works, but the technical preview versions look promising. Offline support will probably be layered on top of the existing engine with few, if any breaking changes.

As an added bonus, having full control over caches improves the online experience as well, particularly on intermittent or slow internet connections.

### Versioned scenes

Most of our customers' projects are in an active phase, with changes committed on a daily basis. In order not to reprocess their entire scene every time they upload a new version, we already do a delta update on the server. This allows our cloud data to be up-to-date, within hours at most. As we increasingly become the "single source of truth", we need to support some sort of version control, however, much like in git:

- Admins should be able to review and approve changes, determining what version "everyone else" sees before it goes live, as well as "staging/preview" versions for internal review.
- Users should be able to revert back to older version to view the state at a given point in time as well as visualizing changes within a time span.
- Offline users should have a very clear idea what version they are currently working on with enforceable expiration dates, etc. Incremental synchronizations while online should enable staying up-to-date fast and easy.

While much remains, we're already in the middle of this process. Again, it will start out simple, with a basic version dropdown in your viewer. Later, we'll add more advanced visualizations of what exactly has changed, where and how, both in terms of geometry and meta-data.

### 2.5D Compositing

Some visualization requires the ability to extract partial renders as an image with an transparency and a depth component ([2.5D](https://en.wikipedia.org/wiki/2.5D)). These 2.5D images can then be augmented, e.g. by adding a 2D outline, and then reintroduced into the 3D scene as 2.5D billboards. Furthermore, meta-data, such as object id, depth, surface normals and materials should be available as masks, allowing complex 2D layering and effects.

Alternatively, 2D context, such as text or lines, can be similarly introduced into the 3D view with a given depth to make them "fit in". A small utility library to compute the 2D projection of 3D coordinates and vice versa should help "anchor" these in the 3D view. With a depth component, we could even apply lighting to these billboards, making them visually "fit in", if so desired.

To guarantee that 2D and 3D elements stay in sync, everything will be imported back into the rendering pipeline at a stage of choice, either as [HDR](https://en.wikipedia.org/wiki/High_dynamic_range) images or as regular 8 bit screen bitmaps, post tone-mapping.

All of these things are already available in the engine to some extent. We just need to figure out a nice interface for them and implement what's missing.

### WebGPU

Now that [chrome supports WebGPU](https://developer.chrome.com/blog/webgpu-io2023/), we're ready to start taking advantage of this awesome API. With Apple being a major contributor and early adopter, there's hope that even Safari will support it some day not too far into the future. Either way, we expect to see performance improvements, reduced memory footprints and more awesome visualization of intersection planes and metadata as a result.

For now, we don't plan on introducing any breaking changes, but rather quietly replace the WebGL2 implementation with a WebGPU one, keeping them both in place until all browsers support WebGPU. In the transition phase, some new features may only be available on browsers that support WebGPU.

### Native APIs

As much as we love the browser platform for it's ubiquity, ease of deployment and cross platform support, native apps still can do things the browser can't, particularly on Apple devices. With a small team and a strong desire to remain agile, we're reluctant to duplicate our efforts, however.

Despite its name, WebGPU is very much a native API too, but with great cross platform support. As we move our rendering engine to web assembly using languages such as C++, rust and zig, there is a golden opportunity to leverage the same code base on all platforms without much compromise. This should form a reuseable core around which we can then deploy native versions of our API in a cost effective manner. No promises, though!

## Conclusion

While most of our customers still use our Novoweb viewer app, we increasingly see our API as a core value proposition. With increasing adoption, we're devoting even more time into code quality and documentation. We aim to reach semantic versioning stability for some, if not all of our modules soon.

This version represents a major step forward and a brand-new, clean and lean platform on which we intend to continue innovating for a long time. We hope you'll join us in this adventure by migrating to, or adopting our new API. As you probably can tell, we're enthusiastic about our technology and its future. We take great pride in the quality of our work, so please feel free to contact us for questions and feedback!

Best regards,

Novorender dev team!
