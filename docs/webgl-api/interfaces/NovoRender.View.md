---
id: "NovoRender.View"
title: "Interface: View"
sidebar_label: "View"
custom_edit_url: null
---

[NovoRender](../namespaces/NovoRender.md).View

A 3D view.

**`remarks`**
3D views will render a scene into a provided canvas element.
Any changes to the scene, camera or settings are automatically rendered in a background animation loop.
When the camera stops moving, additional frames may also be rendered to incrementally refine the quality of the output image over a certain period.
Setting the [render](NovoRender.View.md#render) property to false will stop such automatic updates.

## Properties

### autoRender

• **autoRender**: `boolean`

Flag whether to automatically render or not. Default is true.

___

### camera

• **camera**: [`Camera`](NovoRender.Camera.md)

The camera to use.

___

### performanceStatistics

• `Readonly` **performanceStatistics**: [`PerformanceStatistics`](NovoRender.PerformanceStatistics.md)

Performance statistics from previously rendered frame.

___

### scene

• `Optional` **scene**: [`Scene`](NovoRender.Scene.md)

The scene to render.

**`remarks`**
Assigning a new scene initiates a sequence of geometry downloads that may take a few seconds to produce any visual results and then refine over time.

___

### settings

• `Readonly` **settings**: [`RenderSettings`](NovoRender.RenderSettings.md)

Current render settings.

## Methods

### applySettings

▸ **applySettings**(`changes`): `void`

Apply render settings changes using deep copy.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `changes` | `Partial`<`Readonly`<[`RenderSettings`](NovoRender.RenderSettings.md)\>\> | changes to current render settings. |

#### Returns

`void`

___

### convertToBlob

▸ **convertToBlob**(`options?`): `Promise`<`Blob`\>

Convert image to a data blob.

**`remarks`** See [https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas/convertToBlob](https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas/convertToBlob) for more details.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `options?` | [`ImageEncodeOptions_`](NovoRender.ImageEncodeOptions_.md) | Image encoding options. |

#### Returns

`Promise`<`Blob`\>

A Promise to a Blob object representing the latest rendered image or undefined if device/browser does not yet support this functionality.

___

### measure

▸ **measure**(`x`, `y`): `Promise`<[`MeasureInfo`](NovoRender.MeasureInfo.md)\>

Get [MeasureInfo](NovoRender.MeasureInfo.md) of nearest object (if any) at the specified pixel coordinate.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `x` | `number` | view x coordinate (0=left) |
| `y` | `number` | view y coordinate (0=top) |

#### Returns

`Promise`<[`MeasureInfo`](NovoRender.MeasureInfo.md)\>

`undefined` if no object intersection was found.

___

### pick

▸ **pick**(`x`, `y`): `Promise`<[`PickInfo`](NovoRender.PickInfo.md)\>

Pick nearest object (if any) at the specified pixel coordinate.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `x` | `number` | view x coordinate (0=left) |
| `y` | `number` | view y coordinate (0=top) |

#### Returns

`Promise`<[`PickInfo`](NovoRender.PickInfo.md)\>

`undefined` if no object intersection was found.

___

### render

▸ **render**(`frameCallback?`): `Promise`<[`RenderOutput`](NovoRender.RenderOutput.md)\>

Render the next frame.

**`remarks`**
This function is meant to be called in a loop.
You should avoid calling it from a timer or a requestAnimationFrame callback since it's already being throttled to the screen's vertical blanking.
If the existing state has already been rendered, it will wait until there are changes before initiating a new render.
The returned render output object will have methods for post processing and for getting an image you can display in your own canvas.
You must call `dispose()` on the returned render output object before you can call this function again.

#### Parameters

| Name | Type |
| :------ | :------ |
| `frameCallback?` | () => `void` |

#### Returns

`Promise`<[`RenderOutput`](NovoRender.RenderOutput.md)\>

A promise of the rendered output.

___

### transferToImageBitmap

▸ **transferToImageBitmap**(): `Promise`<`ImageBitmap`\>

Transfer recently rendered image to a bitmap.

**`remarks`** See [https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas/transferToImageBitmap](https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas/transferToImageBitmap) for more details.

#### Returns

`Promise`<`ImageBitmap`\>

A Promise to the transferred bitmap or undefined if device/browser does not yet support this functionality.

___

### updatePickBuffers

▸ **updatePickBuffers**(): `Promise`<`void`\>

Updates the pick buffers

#### Returns

`Promise`<`void`\>
