---
id: "NovoRender"
title: "Namespace: NovoRender"
sidebar_label: "NovoRender"
sidebar_position: 0
custom_edit_url: null
---

## Namespaces

- [Internal](NovoRender.Internal.md)

## Enumerations

- [NodeType](../enums/NovoRender.NodeType.md)
- [WellKnownSceneUrls](../enums/NovoRender.WellKnownSceneUrls.md)

## Interfaces

- [AABB](../interfaces/NovoRender.AABB.md)
- [API](../interfaces/NovoRender.API.md)
- [APIOptions](../interfaces/NovoRender.APIOptions.md)
- [ArcValues](../interfaces/NovoRender.ArcValues.md)
- [BoundingSphere](../interfaces/NovoRender.BoundingSphere.md)
- [Camera](../interfaces/NovoRender.Camera.md)
- [CameraController](../interfaces/NovoRender.CameraController.md)
- [CameraProperties](../interfaces/NovoRender.CameraProperties.md)
- [CameraValues](../interfaces/NovoRender.CameraValues.md)
- [ColorHighlightParams](../interfaces/NovoRender.ColorHighlightParams.md)
- [CylinderValues](../interfaces/NovoRender.CylinderValues.md)
- [DeviationColorGradientNode](../interfaces/NovoRender.DeviationColorGradientNode.md)
- [DirectionalLight](../interfaces/NovoRender.DirectionalLight.md)
- [DrawObject](../interfaces/NovoRender.DrawObject.md)
- [DuoMeasurementValues](../interfaces/NovoRender.DuoMeasurementValues.md)
- [DynamicAsset](../interfaces/NovoRender.DynamicAsset.md)
- [DynamicObject](../interfaces/NovoRender.DynamicObject.md)
- [ElevationColorGradientNode](../interfaces/NovoRender.ElevationColorGradientNode.md)
- [Environment](../interfaces/NovoRender.Environment.md)
- [EnvironmentDescription](../interfaces/NovoRender.EnvironmentDescription.md)
- [FlightControllerParams](../interfaces/NovoRender.FlightControllerParams.md)
- [GeoLocation](../interfaces/NovoRender.GeoLocation.md)
- [GrayscaleParams](../interfaces/NovoRender.GrayscaleParams.md)
- [HSLAOptions](../interfaces/NovoRender.HSLAOptions.md)
- [HierarcicalObjectReference](../interfaces/NovoRender.HierarcicalObjectReference.md)
- [Highlight](../interfaces/NovoRender.Highlight.md)
- [ImageEncodeOptions\_](../interfaces/NovoRender.ImageEncodeOptions_.md)
- [IntensityColorGradientNode](../interfaces/NovoRender.IntensityColorGradientNode.md)
- [LineValues](../interfaces/NovoRender.LineValues.md)
- [LinearTransform](../interfaces/NovoRender.LinearTransform.md)
- [MeasureAPI](../interfaces/NovoRender.MeasureAPI.md)
- [MeasureEntity](../interfaces/NovoRender.MeasureEntity.md)
- [MeasureInfo](../interfaces/NovoRender.MeasureInfo.md)
- [MeasureObject](../interfaces/NovoRender.MeasureObject.md)
- [MeasureScene](../interfaces/NovoRender.MeasureScene.md)
- [MeasureSettings](../interfaces/NovoRender.MeasureSettings.md)
- [NeutralHighlightParams](../interfaces/NovoRender.NeutralHighlightParams.md)
- [ObjectDB](../interfaces/NovoRender.ObjectDB.md)
- [ObjectData](../interfaces/NovoRender.ObjectData.md)
- [ObjectHighlighter](../interfaces/NovoRender.ObjectHighlighter.md)
- [ObjectReference](../interfaces/NovoRender.ObjectReference.md)
- [OrbitControllerParams](../interfaces/NovoRender.OrbitControllerParams.md)
- [OrthoControllerParams](../interfaces/NovoRender.OrthoControllerParams.md)
- [OutlineParams](../interfaces/NovoRender.OutlineParams.md)
- [PerformanceStatistics](../interfaces/NovoRender.PerformanceStatistics.md)
- [PickInfo](../interfaces/NovoRender.PickInfo.md)
- [PlaneValues](../interfaces/NovoRender.PlaneValues.md)
- [RGBAOptions](../interfaces/NovoRender.RGBAOptions.md)
- [RenderOutput](../interfaces/NovoRender.RenderOutput.md)
- [RenderSettings](../interfaces/NovoRender.RenderSettings.md)
- [Scene](../interfaces/NovoRender.Scene.md)
- [ScreenSpaceAmbientOcclusionParams](../interfaces/NovoRender.ScreenSpaceAmbientOcclusionParams.md)
- [SearchOptions](../interfaces/NovoRender.SearchOptions.md)
- [SearchPattern](../interfaces/NovoRender.SearchPattern.md)
- [StaticControllerParams](../interfaces/NovoRender.StaticControllerParams.md)
- [TemporalAntialiasingParams](../interfaces/NovoRender.TemporalAntialiasingParams.md)
- [TransparentHighlightParams](../interfaces/NovoRender.TransparentHighlightParams.md)
- [TurntableControllerParams](../interfaces/NovoRender.TurntableControllerParams.md)
- [View](../interfaces/NovoRender.View.md)

## Type aliases

### AtLeastOne

Ƭ **AtLeastOne**<`T`, `U`\>: `Partial`<`T`\> & `U`[keyof `U`]

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `T` |
| `U` | { [K in keyof T]: Pick<T, K\> } |

___

### CameraControllerParams

Ƭ **CameraControllerParams**: [`StaticControllerParams`](../interfaces/NovoRender.StaticControllerParams.md) \| [`TurntableControllerParams`](../interfaces/NovoRender.TurntableControllerParams.md) \| [`OrbitControllerParams`](../interfaces/NovoRender.OrbitControllerParams.md) \| [`FlightControllerParams`](../interfaces/NovoRender.FlightControllerParams.md) \| [`OrthoControllerParams`](../interfaces/NovoRender.OrthoControllerParams.md)

___

### ColorRGB

Ƭ **ColorRGB**: `ReadonlyVec3`

Color expressed as a 3D vector with ranges [0.0 - 1.0] for red, green and blue components respectively.

___

### ColorRGBA

Ƭ **ColorRGBA**: `ReadonlyVec4`

Color expressed as a 4D vector with ranges [0.0 - 1.0] for red, green, blue and alpha components respectively.

___

### CylinerMeasureType

Ƭ **CylinerMeasureType**: ``"center"`` \| ``"closest"`` \| ``"furthest"``

___

### EdgeValues

Ƭ **EdgeValues**: [`LineValues`](../interfaces/NovoRender.LineValues.md) \| [`ArcValues`](../interfaces/NovoRender.ArcValues.md)

EdgeValues is a collection of values for measurment on a single edge

___

### FaceValues

Ƭ **FaceValues**: [`PlaneValues`](../interfaces/NovoRender.PlaneValues.md) \| [`CylinderValues`](../interfaces/NovoRender.CylinderValues.md)

FaceValues is a collection of values for measurment on a single face

___

### FixedSizeArray

Ƭ **FixedSizeArray**<`N`, `T`\>: `N` extends ``0`` ? `never`[] : { `0`: `T` ; `length`: `N`  } & `ReadonlyArray`<`T`\>

Fixed size, read-only array type.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `N` | extends `number` |
| `T` | `T` |

___

### HSLATransformHighlightParams

Ƭ **HSLATransformHighlightParams**: { `kind`: ``"hsla"``  } & [`AtLeastOne`](NovoRender.md#atleastone)<[`HSLAOptions`](../interfaces/NovoRender.HSLAOptions.md)\>

Hue, saturation, lightness, alpha transform highlight parameters

___

### HighlightParams

Ƭ **HighlightParams**: [`NeutralHighlightParams`](../interfaces/NovoRender.NeutralHighlightParams.md) \| [`TransparentHighlightParams`](../interfaces/NovoRender.TransparentHighlightParams.md) \| [`ColorHighlightParams`](../interfaces/NovoRender.ColorHighlightParams.md) \| [`RGBATransformHighlightParams`](NovoRender.md#rgbatransformhighlightparams) \| [`HSLATransformHighlightParams`](NovoRender.md#hslatransformhighlightparams)

___

### MeasurementValues

Ƭ **MeasurementValues**: [`EdgeValues`](NovoRender.md#edgevalues) \| [`FaceValues`](NovoRender.md#facevalues) \| [`DuoMeasurementValues`](../interfaces/NovoRender.DuoMeasurementValues.md)

MeasurementValues is a collection of values for any measurment

___

### ObjectId

Ƭ **ObjectId**: `number`

Integer index/handle for identifying a single object

___

### ObjectIdArray

Ƭ **ObjectIdArray**: `ReadonlyArray`<[`ObjectId`](NovoRender.md#objectid)\>

Read only array of integer indices/handles for identifying a set of objects

___

### PathInfo

Ƭ **PathInfo**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `centerDepth` | `number` |
| `originalIndex` | `number` |
| `path` | `string` |

___

### PostEffectParams

Ƭ **PostEffectParams**: [`GrayscaleParams`](../interfaces/NovoRender.GrayscaleParams.md) \| [`TemporalAntialiasingParams`](../interfaces/NovoRender.TemporalAntialiasingParams.md) \| [`ScreenSpaceAmbientOcclusionParams`](../interfaces/NovoRender.ScreenSpaceAmbientOcclusionParams.md) \| [`OutlineParams`](../interfaces/NovoRender.OutlineParams.md)

___

### RGBATransformHighlightParams

Ƭ **RGBATransformHighlightParams**: { `kind`: ``"rgba"``  } & [`AtLeastOne`](NovoRender.md#atleastone)<[`RGBAOptions`](../interfaces/NovoRender.RGBAOptions.md)\>

Red, green, blue, alpha transform highlight parameters

___

### RenderSettingsParams

Ƭ **RenderSettingsParams**: `Partial`<`Readonly`<[`RenderSettings`](../interfaces/NovoRender.RenderSettings.md)\>\>

A partial, read only variant of render settings for initial settings and updates.

## Functions

### createAPI

▸ **createAPI**(`options?`): [`API`](../interfaces/NovoRender.API.md)

Create an instance of the NovoRender API.

**`throws`** Error if current browser and device has insufficient 3D rendering capabilities.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `options?` | [`APIOptions`](../interfaces/NovoRender.APIOptions.md) | Custom settings [APIOptions](../interfaces/NovoRender.APIOptions.md) to create API. |

#### Returns

[`API`](../interfaces/NovoRender.API.md)

An initialized API object

___

### createMeasureAPI

▸ **createMeasureAPI**(): [`MeasureAPI`](../interfaces/NovoRender.MeasureAPI.md)

#### Returns

[`MeasureAPI`](../interfaces/NovoRender.MeasureAPI.md)
