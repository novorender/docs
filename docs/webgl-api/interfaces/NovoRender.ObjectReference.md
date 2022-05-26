---
id: "NovoRender.ObjectReference"
title: "Interface: ObjectReference"
sidebar_label: "ObjectReference"
custom_edit_url: null
---

[NovoRender](../namespaces/NovoRender.md).ObjectReference

Lightweight reference to a single object within a scene instance.

**`remarks`**
Object metadata are not loaded with scene automatically and may require an additional server request. This interface contains only the identity required to perform such a request.

## Hierarchy

- **`ObjectReference`**

  ↳ [`HierarcicalObjectReference`](NovoRender.HierarcicalObjectReference.md)

## Properties

### id

• `Readonly` **id**: `number`

The id of the object

## Methods

### loadMetaData

▸ **loadMetaData**(): `Promise`<[`ObjectData`](NovoRender.ObjectData.md)\>

Load the associated object meta data.

#### Returns

`Promise`<[`ObjectData`](NovoRender.ObjectData.md)\>
