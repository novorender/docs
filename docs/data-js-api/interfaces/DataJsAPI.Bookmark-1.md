---
id: "DataJsAPI.Bookmark-1"
title: "Interface: Bookmark"
sidebar_label: "Bookmark"
custom_edit_url: null
---

[DataJsAPI](../namespaces/DataJsAPI.md).Bookmark

Bookmark, used to store camera parameters such as postion, rotation, fov etc.

## Properties

### camera

• `Optional` **camera**: `any`

Bookmark camera position.

___

### clippingPlanes

• `Optional` **clippingPlanes**: [`ClippingPlanes`](DataJsAPI.Bookmark.ClippingPlanes.md)

Clipping planes

___

### clippingVolume

• `Optional` **clippingVolume**: [`ClippingVolume`](DataJsAPI.Bookmark.ClippingVolume.md)

Clipping volume

___

### description

• `Optional` **description**: `string`

Bookmark description.

___

### followPath

• `Optional` **followPath**: `Object`

Follow path

#### Type declaration

| Name | Type |
| :------ | :------ |
| `id` | `number` |
| `profile` | `number` |

___

### grid

• `Optional` **grid**: `any`

Grid settings

___

### grouping

• `Optional` **grouping**: `string`

Grouping.

___

### id

• `Optional` **id**: `string`

Bookmark id.

___

### img

• `Optional` **img**: `string`

Bookmark preview image as base64 encoded.

___

### measurement

• `Optional` **measurement**: `any`[]

Measurement points

___

### name

• **name**: `string`

Bookmark name.

___

### objectGroups

• `Optional` **objectGroups**: [`ObjectGroup`](DataJsAPI.Bookmark.ObjectGroup.md)[]

Bookmark objects groups.

___

### objectMeasurement

• `Optional` **objectMeasurement**: [`MeasureObjectPoint`](DataJsAPI.MeasureObjectPoint.md)[]

Measurement objects points

___

### ortho

• `Optional` **ortho**: `any`

Bookmark ortho camera.

___

### selectedOnly

• **selectedOnly**: `boolean`

Show selection only in 3D

___

### selectionBasket

• `Optional` **selectionBasket**: `Object`

Selection basket

#### Type declaration

| Name | Type |
| :------ | :------ |
| `ids` | `number`[] |
| `mode` | `number` |
