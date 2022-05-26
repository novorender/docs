---
id: "NovoRender.MeasureObject"
title: "Interface: MeasureObject"
sidebar_label: "MeasureObject"
custom_edit_url: null
---

[NovoRender](../namespaces/NovoRender.md).MeasureObject

## Properties

### id

• `Readonly` **id**: `number`

___

### selectedEntity

• `Readonly` **selectedEntity**: [`MeasureEntity`](NovoRender.MeasureEntity.md)

## Methods

### renderMeasureEntity

▸ **renderMeasureEntity**(`view`, `width`, `height`): `Promise`<[`DrawObject`](NovoRender.DrawObject.md)[]\>

Returns a draw object with 2d screen coordinates

#### Parameters

| Name | Type |
| :------ | :------ |
| `view` | [`View`](NovoRender.View.md) |
| `width` | `number` |
| `height` | `number` |

#### Returns

`Promise`<[`DrawObject`](NovoRender.DrawObject.md)[]\>
