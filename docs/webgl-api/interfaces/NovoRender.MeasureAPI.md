---
id: "NovoRender.MeasureAPI"
title: "Interface: MeasureAPI"
sidebar_label: "MeasureAPI"
custom_edit_url: null
---

[NovoRender](../namespaces/NovoRender.md).MeasureAPI

Measure api loads from same scene assets. Brep files are required

## Methods

### dispose

▸ **dispose**(): `Promise`<`void`\>

#### Returns

`Promise`<`void`\>

___

### loadScene

▸ **loadScene**(`url`): `Promise`<[`MeasureScene`](NovoRender.MeasureScene.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `url` | `string` \| `URL` |

#### Returns

`Promise`<[`MeasureScene`](NovoRender.MeasureScene.md)\>

___

### toPathPoints

▸ **toPathPoints**(`points`, `view`, `width`, `height`): [`ReadonlyVec2`[], `ReadonlyVec2`[]]

Converts world space points to on screen pixel path and points

#### Parameters

| Name | Type |
| :------ | :------ |
| `points` | `ReadonlyVec3`[] |
| `view` | [`View`](NovoRender.View.md) |
| `width` | `number` |
| `height` | `number` |

#### Returns

[`ReadonlyVec2`[], `ReadonlyVec2`[]]
