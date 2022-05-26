---
id: "NovoRender.ObjectDB"
title: "Interface: ObjectDB"
sidebar_label: "ObjectDB"
custom_edit_url: null
---

[NovoRender](../namespaces/NovoRender.md).ObjectDB

Database interface to retrive object's data in scene. Used internally from loaded [Scene](NovoRender.Scene.md) interface.

**`remarks`**
This interface is usually created automatically based on scene creation.
You may make your own implementation for custom data model, e.g. for testing or in-house databases.

## Methods

### getObjectMetdata

▸ **getObjectMetdata**(`id`): `Promise`<[`ObjectData`](NovoRender.ObjectData.md)\>

Get [ObjectData](NovoRender.ObjectData.md) by scene object id

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `number` |

#### Returns

`Promise`<[`ObjectData`](NovoRender.ObjectData.md)\>

___

### search

▸ **search**(`filter`, `signal`): `AsyncIterableIterator`<[`HierarcicalObjectReference`](NovoRender.HierarcicalObjectReference.md)\>

Search for objects.

**`remarks`**
See [Scene.search](NovoRender.Scene.md#search) for more details.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `filter` | [`SearchOptions`](NovoRender.SearchOptions.md) | [SearchOptions](NovoRender.SearchOptions.md) filtering options. |
| `signal` | `AbortSignal` | Abort request signal. |

#### Returns

`AsyncIterableIterator`<[`HierarcicalObjectReference`](NovoRender.HierarcicalObjectReference.md)\>

Async iterator of [HierarcicalObjectReference](NovoRender.HierarcicalObjectReference.md)
