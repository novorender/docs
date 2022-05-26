---
id: "NovoRender.RenderOutput"
title: "Interface: RenderOutput"
sidebar_label: "RenderOutput"
custom_edit_url: null
---

[NovoRender](../namespaces/NovoRender.md).RenderOutput

## Properties

### hasViewChanged

• `Readonly` **hasViewChanged**: `boolean`

___

### renderSettings

• `Readonly` **renderSettings**: [`RenderSettings`](NovoRender.RenderSettings.md)

___

### statistics

• `Readonly` **statistics**: [`PerformanceStatistics`](NovoRender.PerformanceStatistics.md)

___

### viewClipMatrix

• `Readonly` **viewClipMatrix**: `ReadonlyMat4`

___

### viewWorldMatrix

• `Readonly` **viewWorldMatrix**: `ReadonlyMat4`

___

### worldViewMatrix

• `Readonly` **worldViewMatrix**: `ReadonlyMat4`

## Methods

### applyPostEffect

▸ **applyPostEffect**(`params`): `Promise`<`boolean` \| `void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`PostEffectParams`](../namespaces/NovoRender.md#posteffectparams) |

#### Returns

`Promise`<`boolean` \| `void`\>

___

### getImage

▸ **getImage**(): `Promise`<`ImageBitmap`\>

#### Returns

`Promise`<`ImageBitmap`\>

___

### measure

▸ **measure**(`x`, `y`): `Promise`<[`MeasureInfo`](NovoRender.MeasureInfo.md)\>

Get [MeasureInfo](NovoRender.MeasureInfo.md) of nearest object (if any) at the specified pixel coordinate.
updatePickBuffers() must be called on view to get updated pick information

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
updatePickBuffers() must be called on view to get updated pick information

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `x` | `number` | view x coordinate (0=left) |
| `y` | `number` | view y coordinate (0=top) |

#### Returns

`Promise`<[`PickInfo`](NovoRender.PickInfo.md)\>

`undefined` if no object intersection was found.
