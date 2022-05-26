---
id: "NovoRender.API"
title: "Interface: API"
sidebar_label: "API"
custom_edit_url: null
---

[NovoRender](../namespaces/NovoRender.md).API

A NovoRender API instance.

## Properties

### animate

• **animate**: `FrameRequestCallback`

Callback that is called on each frame just before rendering.

**`remarks`**
Using this callback instead of in your own requestAnimationFrame() callback is recommended to ensure your updates are applied consistently and are properly synchronized.
If you have disabled automatic rendering by setting [run](NovoRender.API.md#run) = false, this callback is not called unless you manually call [update](NovoRender.API.md#update).

___

### run

• **run**: `boolean`

Enable or disable automatic rendering.

**`remarks`**
This value is set to true by default when a new API is created.
When true, the api will use requestAnimationFrame() callback to automatically update all active views and controllers.
Setting it to false will have the effect of pausing all rendering and camera motion.
You may still call [update](NovoRender.API.md#update) to manually render all views frame and update camera motion controllers.

___

### version

• `Readonly` **version**: `string`

API version string, expressed using semantic versioning [https://semver.org/](https://semver.org/).

## Methods

### availableEnvironments

▸ **availableEnvironments**(`indexUrl?`): `Promise`<readonly [`EnvironmentDescription`](NovoRender.EnvironmentDescription.md)[]\>

Retrieve list of available background/IBL environments.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `indexUrl?` | `string` | The absolute or relative url of the index.json file. Relative url will be relative to the novorender api script url. If undefined, "/assets/env/index.json" will be used by default. |

#### Returns

`Promise`<readonly [`EnvironmentDescription`](NovoRender.EnvironmentDescription.md)[]\>

The controller object

___

### createCameraController

▸ **createCameraController**(`params`): [`CameraController`](NovoRender.CameraController.md)

Create a camera motion controller.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `params` | [`StaticControllerParams`](NovoRender.StaticControllerParams.md) | The controller parameters. |

#### Returns

[`CameraController`](NovoRender.CameraController.md)

The controller object

▸ **createCameraController**(`params`): [`CameraController`](NovoRender.CameraController.md)

Create a camera motion controller.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `params` | [`TurntableControllerParams`](NovoRender.TurntableControllerParams.md) | The controller parameters. |

#### Returns

[`CameraController`](NovoRender.CameraController.md)

The controller object

▸ **createCameraController**(`params`, `domElement`): [`CameraController`](NovoRender.CameraController.md)

Create a camera motion controller.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `params` | [`OrbitControllerParams`](NovoRender.OrbitControllerParams.md) | The controller parameters. |
| `domElement` | `HTMLElement` | The HTML DOM element to listen for mouse/touch events. This can only be set when the controller is created. |

#### Returns

[`CameraController`](NovoRender.CameraController.md)

The controller object

▸ **createCameraController**(`params`, `domElement`): [`CameraController`](NovoRender.CameraController.md)

Create a camera motion controller.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `params` | [`FlightControllerParams`](NovoRender.FlightControllerParams.md) | The controller parameters. |
| `domElement` | `HTMLElement` | The HTML DOM element to listen for mouse/touch events. This can only be set when the controller is created. |

#### Returns

[`CameraController`](NovoRender.CameraController.md)

The controller object

▸ **createCameraController**(`params`, `domElement`): [`CameraController`](NovoRender.CameraController.md)

Create a camera motion controller.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `params` | [`OrthoControllerParams`](NovoRender.OrthoControllerParams.md) | The controller parameters. |
| `domElement` | `HTMLElement` | The HTML DOM element to listen for mouse/touch events. This can only be set when the controller is created. |

#### Returns

[`CameraController`](NovoRender.CameraController.md)

The controller object

___

### createHighlight

▸ **createHighlight**(`params`): [`Highlight`](NovoRender.Highlight.md)

Create an object highlight

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `params` | [`NeutralHighlightParams`](NovoRender.NeutralHighlightParams.md) | Highlight parameters. |

#### Returns

[`Highlight`](NovoRender.Highlight.md)

A highlight object that can be used in [RenderSettings.objectHighlights](NovoRender.RenderSettings.md#objecthighlights).

▸ **createHighlight**(`params`): [`Highlight`](NovoRender.Highlight.md)

Create an object highlight

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `params` | [`TransparentHighlightParams`](NovoRender.TransparentHighlightParams.md) | Highlight parameters. |

#### Returns

[`Highlight`](NovoRender.Highlight.md)

A highlight object that can be used in [RenderSettings.objectHighlights](NovoRender.RenderSettings.md#objecthighlights).

▸ **createHighlight**(`params`): [`Highlight`](NovoRender.Highlight.md)

Create an object highlight

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `params` | [`ColorHighlightParams`](NovoRender.ColorHighlightParams.md) | Highlight parameters. |

#### Returns

[`Highlight`](NovoRender.Highlight.md)

A highlight object that can be used in [RenderSettings.objectHighlights](NovoRender.RenderSettings.md#objecthighlights).

▸ **createHighlight**(`params`): [`Highlight`](NovoRender.Highlight.md)

Create an object highlight

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `params` | [`RGBATransformHighlightParams`](../namespaces/NovoRender.md#rgbatransformhighlightparams) | Highlight parameters. |

#### Returns

[`Highlight`](NovoRender.Highlight.md)

A highlight object that can be used in [RenderSettings.objectHighlights](NovoRender.RenderSettings.md#objecthighlights).

▸ **createHighlight**(`params`): [`Highlight`](NovoRender.Highlight.md)

Create an object highlight

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `params` | [`HSLATransformHighlightParams`](../namespaces/NovoRender.md#hslatransformhighlightparams) | Highlight parameters. |

#### Returns

[`Highlight`](NovoRender.Highlight.md)

A highlight object that can be used in [RenderSettings.objectHighlights](NovoRender.RenderSettings.md#objecthighlights).

___

### createView

▸ **createView**(`settings?`, `htmlRenderCanvas?`): `Promise`<[`View`](NovoRender.View.md)\>

Create a 3D View.

**`remarks`** It is recommend that you specify the initial display pixel width and height here to avoid unnecessary reallocation of render buffers.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `settings?` | `Partial`<`Readonly`<[`RenderSettings`](NovoRender.RenderSettings.md)\>\> | Initial {@link RenderSettingParams} settings to use for view. |
| `htmlRenderCanvas?` | `HTMLCanvasElement` | - |

#### Returns

`Promise`<[`View`](NovoRender.View.md)\>

A promise of a newly created [View](NovoRender.View.md).

___

### dispose

▸ **dispose**(): `void`

Stop all rendering and release all resources.

**`remarks`**
Calling this function will effectively destroy this instance of the API and any associated scenes and views etc.
This function allows you to explicitly release the associated GPU resources and memory caches used by the API without waiting for the garbage collector to do so.

#### Returns

`void`

___

### loadAsset

▸ **loadAsset**(`url`): `Promise`<[`DynamicAsset`](NovoRender.DynamicAsset.md)\>

Load the specificed asset into memory.

**`remarks`**
Assets must be passed to [Scene.createDynamicObject](NovoRender.Scene.md#createdynamicobject) to be rendered.
Currently, this must be a [glTF](https://www.khronos.org/gltf/) file (*.gltf | *.glb).
Cross domain urls requires CORS headers to be set appropriately.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `url` | `URL` | The asset url. |

#### Returns

`Promise`<[`DynamicAsset`](NovoRender.DynamicAsset.md)\>

A promise of the loaded [DynamicAsset](NovoRender.DynamicAsset.md).

___

### loadEnvironment

▸ **loadEnvironment**(`environment`): `Promise`<[`Environment`](NovoRender.Environment.md)\>

Load the specificed environment into memory.

#### Parameters

| Name | Type |
| :------ | :------ |
| `environment` | [`EnvironmentDescription`](NovoRender.EnvironmentDescription.md) |

#### Returns

`Promise`<[`Environment`](NovoRender.Environment.md)\>

A promise of the loaded [Environment](NovoRender.Environment.md).

___

### loadScene

▸ **loadScene**(`id`, `db?`): `Promise`<[`Scene`](NovoRender.Scene.md)\>

Load the specificed scene into memory.

**`remarks`**
The loaded scene will not include all 3D or object data immediately as these are automatically downloaded on demand.

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `string` \| `URL` |
| `db?` | [`ObjectDB`](NovoRender.ObjectDB.md) |

#### Returns

`Promise`<[`Scene`](NovoRender.Scene.md)\>

A promise of the loaded [Scene](NovoRender.Scene.md).

___

### update

▸ **update**(): `Promise`<`void`\>

Manually update all views and camera controllers.

**`remarks`**
If you have disabled automatic rendering by setting [run](NovoRender.API.md#run) = false, you can call this function to manually update instead.
This may be useful if you are using requestAnimationFrame yourself and want to have full control over the order by which state gets updated.
The returned promise will resolve at the next animation frame, typically 1/60 of a second, which can be useful if you intend to run a realtime update loop.

#### Returns

`Promise`<`void`\>
