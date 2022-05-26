---
id: "NovoRender.ObjectData"
title: "Interface: ObjectData"
sidebar_label: "ObjectData"
custom_edit_url: null
---

[NovoRender](../namespaces/NovoRender.md).ObjectData

Object metadata.

## Hierarchy

- [`HierarcicalObjectReference`](NovoRender.HierarcicalObjectReference.md)

  ↳ **`ObjectData`**

## Properties

### bounds

• `Optional` `Readonly` **bounds**: `Object`

Bounding volume

#### Type declaration

| Name | Type |
| :------ | :------ |
| `sphere` | [`BoundingSphere`](NovoRender.BoundingSphere.md) |

#### Inherited from

[HierarcicalObjectReference](NovoRender.HierarcicalObjectReference.md).[bounds](NovoRender.HierarcicalObjectReference.md#bounds)

___

### descendants

• `Optional` `Readonly` **descendants**: `number`[]

#### Inherited from

[HierarcicalObjectReference](NovoRender.HierarcicalObjectReference.md).[descendants](NovoRender.HierarcicalObjectReference.md#descendants)

___

### description

• `Optional` `Readonly` **description**: `string`

Description of object (typically from IFC database).

___

### id

• `Readonly` **id**: `number`

The id of the object

#### Inherited from

[HierarcicalObjectReference](NovoRender.HierarcicalObjectReference.md).[id](NovoRender.HierarcicalObjectReference.md#id)

___

### name

• `Readonly` **name**: `string`

Name of object (typically a GUID from IFC database).

___

### path

• `Readonly` **path**: `string`

The path of the object expressed as a hierarchical filesystem-like path string.

#### Inherited from

[HierarcicalObjectReference](NovoRender.HierarcicalObjectReference.md).[path](NovoRender.HierarcicalObjectReference.md#path)

___

### properties

• **properties**: [key: string, value: string][]

String dictionary of any additional metadata properties associated with object

___

### type

• `Readonly` **type**: [`NodeType`](../enums/NovoRender.NodeType.md)

Type of node.

#### Inherited from

[HierarcicalObjectReference](NovoRender.HierarcicalObjectReference.md).[type](NovoRender.HierarcicalObjectReference.md#type)

___

### url

• `Optional` `Readonly` **url**: `string`

Url associated with object

## Methods

### loadMetaData

▸ **loadMetaData**(): `Promise`<[`ObjectData`](NovoRender.ObjectData.md)\>

Load the associated object meta data.

#### Returns

`Promise`<[`ObjectData`](NovoRender.ObjectData.md)\>

#### Inherited from

[HierarcicalObjectReference](NovoRender.HierarcicalObjectReference.md).[loadMetaData](NovoRender.HierarcicalObjectReference.md#loadmetadata)

___

### save

▸ **save**(): `Promise`<`boolean`\>

Save object meta data.

#### Returns

`Promise`<`boolean`\>
