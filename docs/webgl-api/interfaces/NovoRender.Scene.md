---
id: "NovoRender.Scene"
title: "Interface: Scene"
sidebar_label: "Scene"
custom_edit_url: null
---

[NovoRender](../namespaces/NovoRender.md).Scene

Scene document

**`remarks`**
A scene represents the document entity of NovoRender, corresponding to something akin to a top level CAD assembly.
It provides information for both rendering 3D geometry and querying for object metadata.
In order to fascilitate complex datasets on small client devices, scenes load most data on demand and caches a relevant, but still potentially substantial subset in system and GPU memory.
Weaker devices may struggle to host multiple scenes in memory at once, so make sure to remove any references to unused scenes and related objects for effective garbage collection when loading new scenes.

## Properties

### boundingSphere

• `Readonly` **boundingSphere**: [`BoundingSphere`](NovoRender.BoundingSphere.md)

The bounding sphere of the scene in world space.

**`remarks`**
This property is useful for e.g. initial camera positioning based on approximate scene size and center.

___

### dateCreated

• `Readonly` **dateCreated**: `Date`

Date of scene creation

___

### dateLastSaved

• `Readonly` **dateLastSaved**: `Date`

Date of when scene was last saved

___

### description

• `Optional` **description**: `string`

Scene description.

___

### dynamicObjects

• `Readonly` **dynamicObjects**: `IterableIterator`<[`DynamicObject`](NovoRender.DynamicObject.md)\>

List of dynamic objects currently in scene.

**`remarks`**
To add a new dynamic object, see [createDynamicObject](NovoRender.Scene.md#createdynamicobject).
To remove a dynamic object, see [DynamicObject.dispose](NovoRender.DynamicObject.md#dispose).

___

### id

• **id**: `string`

Scene Id

**`remarks`**
For new scenes, this will contain a random string/guid.

___

### location

• `Optional` **location**: [`GeoLocation`](NovoRender.GeoLocation.md)

Geological location of scene.

**`remarks`**
This location is used for calculating correct lighting/sun position for a given time and date. In future, it may also be used for google earth-like background settings and map icons etc. For static structures in particular, providing an accurate location is thus recommended.

___

### objectHighlighter

• `Readonly` **objectHighlighter**: [`ObjectHighlighter`](NovoRender.ObjectHighlighter.md)

An object that allows sets of objects to be highlighted using different color transforms.

___

### subtrees

• `Optional` `Readonly` **subtrees**: (``"terrain"`` \| ``"triangles"`` \| ``"lines"`` \| ``"points"``)[]

Scene subtrees types

**`remark`**
Available types

___

### timezone

• `Optional` **timezone**: `number`

Local timezone expressed in hours from GMT.

**`remarks`**
Information for calculating correct lighting/sun position using local time rather than UTC.

___

### title

• **title**: `string`

Scene title

___

### variants

• `Optional` `Readonly` **variants**: (``"deviation"`` \| ``"intensity"``)[]

## Methods

### computeSunPosition

▸ **computeSunPosition**(`time`): `Object`

Compute sun position.

**`remarks`**
The computation will take into account seasonal changes as well as time.
The [timezone](NovoRender.Scene.md#timezone) may be useful to provide the correct UTC time in the physical area described by the scene but is not used by this method directly.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `time` | `Date` | Desired date and time of day in universal time (UTC). |

#### Returns

`Object`

The sun position, which can then be used in the render settings to visualize the light conditions for a given site on the given time.

| Name | Type |
| :------ | :------ |
| `azimuth` | `number` |
| `inclination` | `number` |

___

### createDynamicObject

▸ **createDynamicObject**(`asset`): [`DynamicObject`](NovoRender.DynamicObject.md)

Create a new dynamic object.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `asset` | [`DynamicAsset`](NovoRender.DynamicAsset.md) | The geometry asset to use for this object. |

#### Returns

[`DynamicObject`](NovoRender.DynamicObject.md)

A new dynamic object, whose state is initially invisible by default.

___

### descendants

▸ **descendants**(`object`, `signal`): `Promise`<`number`[]\>

Returns all descendants

#### Parameters

| Name | Type |
| :------ | :------ |
| `object` | [`HierarcicalObjectReference`](NovoRender.HierarcicalObjectReference.md) |
| `signal` | `AbortSignal` |

#### Returns

`Promise`<`number`[]\>

___

### getObjectReference

▸ **getObjectReference**(`id`): [`ObjectReference`](NovoRender.ObjectReference.md)

Return a queryable object reference.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `id` | `number` | Object Id |

#### Returns

[`ObjectReference`](NovoRender.ObjectReference.md)

___

### search

▸ **search**(`filter`, `signal?`): `AsyncIterableIterator`<[`HierarcicalObjectReference`](NovoRender.HierarcicalObjectReference.md)\>

Search for objects.

**`remarks`**
Scenes contains objects with associated properties.
Loading scenes with millions of objects direcly into memory may be slow or even impossible on memory constrained devices.
This function lets you selectively load object properties based on some criteria.
An example of this is if you want to make a virtual tree view that only load child nodes on demand when the user expands a folder to make your UI scale to very large scenes.
```typescript
const children = scene.search({ parentPath: "rootfolder/subfolder", descentDepth: 1});
for await (const child of children) {
// TODO: append child's properties to UI
}
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `filter` | [`SearchOptions`](NovoRender.SearchOptions.md) | [SearchOptions](NovoRender.SearchOptions.md) filtering options. |
| `signal?` | `AbortSignal` | Abort request signal. |

#### Returns

`AsyncIterableIterator`<[`HierarcicalObjectReference`](NovoRender.HierarcicalObjectReference.md)\>

Async iterator of [HierarcicalObjectReference](NovoRender.HierarcicalObjectReference.md)
