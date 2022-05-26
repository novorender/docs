---
id: "NovoRender.HierarcicalObjectReference"
title: "Interface: HierarcicalObjectReference"
sidebar_label: "HierarcicalObjectReference"
custom_edit_url: null
---

[NovoRender](../namespaces/NovoRender.md).HierarcicalObjectReference

Hierarcical object reference to a single object within a scene instance.

**`remarks`**
This interface extends [ObjectReference](NovoRender.ObjectReference.md) with data required for hierachical tree views and 3D rendering without loading the entire set of metadata.

## Hierarchy

- [`ObjectReference`](NovoRender.ObjectReference.md)

  ↳ **`HierarcicalObjectReference`**

  ↳↳ [`ObjectData`](NovoRender.ObjectData.md)

## Properties

### bounds

• `Optional` `Readonly` **bounds**: `Object`

Bounding volume

#### Type declaration

| Name | Type |
| :------ | :------ |
| `sphere` | [`BoundingSphere`](NovoRender.BoundingSphere.md) |

___

### descendants

• `Optional` `Readonly` **descendants**: `number`[]

___

### id

• `Readonly` **id**: `number`

The id of the object

#### Inherited from

[ObjectReference](NovoRender.ObjectReference.md).[id](NovoRender.ObjectReference.md#id)

___

### path

• `Readonly` **path**: `string`

The path of the object expressed as a hierarchical filesystem-like path string.

___

### type

• `Readonly` **type**: [`NodeType`](../enums/NovoRender.NodeType.md)

Type of node.

## Methods

### loadMetaData

▸ **loadMetaData**(): `Promise`<[`ObjectData`](NovoRender.ObjectData.md)\>

Load the associated object meta data.

#### Returns

`Promise`<[`ObjectData`](NovoRender.ObjectData.md)\>

#### Inherited from

[ObjectReference](NovoRender.ObjectReference.md).[loadMetaData](NovoRender.ObjectReference.md#loadmetadata)
