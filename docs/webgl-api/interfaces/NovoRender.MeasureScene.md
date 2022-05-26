---
id: "NovoRender.MeasureScene"
title: "Interface: MeasureScene"
sidebar_label: "MeasureScene"
custom_edit_url: null
---

[NovoRender](../namespaces/NovoRender.md).MeasureScene

Scene with objects being measured. Brep files are required

## Methods

### downloadMeasureObject

▸ **downloadMeasureObject**(`id`, `selectionPosition`): `Promise`<[`MeasureObject`](NovoRender.MeasureObject.md)\>

Downloads the measure data for an object

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `number` |
| `selectionPosition` | `vec3` |

#### Returns

`Promise`<[`MeasureObject`](NovoRender.MeasureObject.md)\>

___

### getCameraValues

▸ **getCameraValues**(`a`, `cameraDir`): `Promise`<[`CameraValues`](NovoRender.CameraValues.md)\>

Get suggested camea values for selected object
For cylinder values snap to the closest axis on the cylinder

#### Parameters

| Name | Type |
| :------ | :------ |
| `a` | [`MeasureEntity`](NovoRender.MeasureEntity.md) |
| `cameraDir` | `vec3` |

#### Returns

`Promise`<[`CameraValues`](NovoRender.CameraValues.md)\>

___

### measure

▸ **measure**(`a`, `b?`, `settingA?`, `settingB?`): `Promise`<[`MeasurementValues`](../namespaces/NovoRender.md#measurementvalues)\>

Measure objet, if b is undefined then single measure values are returned else the measurement between 2 objects

#### Parameters

| Name | Type |
| :------ | :------ |
| `a` | [`MeasureEntity`](NovoRender.MeasureEntity.md) |
| `b?` | [`MeasureEntity`](NovoRender.MeasureEntity.md) |
| `settingA?` | [`MeasureSettings`](NovoRender.MeasureSettings.md) |
| `settingB?` | [`MeasureSettings`](NovoRender.MeasureSettings.md) |

#### Returns

`Promise`<[`MeasurementValues`](../namespaces/NovoRender.md#measurementvalues)\>

___

### measureToPoint

▸ **measureToPoint**(`a`, `b`, `setting?`): `Promise`<[`DuoMeasurementValues`](NovoRender.DuoMeasurementValues.md)\>

Measure distance between a measurement object an a 3d point

#### Parameters

| Name | Type |
| :------ | :------ |
| `a` | [`MeasureEntity`](NovoRender.MeasureEntity.md) |
| `b` | `vec3` |
| `setting?` | [`MeasureSettings`](NovoRender.MeasureSettings.md) |

#### Returns

`Promise`<[`DuoMeasurementValues`](NovoRender.DuoMeasurementValues.md)\>

___

### pointToPoint

▸ **pointToPoint**(`a`, `b`): [`DuoMeasurementValues`](NovoRender.DuoMeasurementValues.md)

Measure distance between 2 points

#### Parameters

| Name | Type |
| :------ | :------ |
| `a` | `vec3` |
| `b` | `vec3` |

#### Returns

[`DuoMeasurementValues`](NovoRender.DuoMeasurementValues.md)
