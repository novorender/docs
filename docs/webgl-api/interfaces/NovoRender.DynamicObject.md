---
id: "NovoRender.DynamicObject"
title: "Interface: DynamicObject"
sidebar_label: "DynamicObject"
custom_edit_url: null
---

[NovoRender](../namespaces/NovoRender.md).DynamicObject

3D object that can be animated and moved.

**`remarks`**
Unlike the static geometry of a scene, dynamic objects can be added/removed and moved around after a scene has been created.
This functionality comes at a cost, however.
Dynamic objects must be fully loaded into client memory before they can be rendered, which restricts their practial use to relatively trivial geometry only.
Nor can they take advantage of globally pre-baked information, such as indirect light.
They also lack several features of static scene geometry, such as object picking and clipping volumes etc.
Dynamic objects can be helpful for 3D UI widgets, background animations of e.g. moving people, cars or animals etc.

## Properties

### geometry

• `Readonly` **geometry**: [`DynamicAsset`](NovoRender.DynamicAsset.md)

The geometry used for rendering.

___

### position

• **position**: `ReadonlyVec3`

The 3D position of object in world space coordinates.

___

### rotation

• **rotation**: `ReadonlyQuat`

The 3D orientation of object in world space expressed as a quaternion.

___

### scale

• **scale**: `ReadonlyVec3`

The scale of object in local coordinates.

___

### visible

• **visible**: `boolean`

Whether to render object or not.

## Methods

### dispose

▸ **dispose**(): `void`

Remove object from scene and free up any associated resources.

#### Returns

`void`
