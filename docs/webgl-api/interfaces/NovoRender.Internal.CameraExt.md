---
id: "NovoRender.Internal.CameraExt"
title: "Interface: CameraExt"
sidebar_label: "CameraExt"
custom_edit_url: null
---

[NovoRender](../namespaces/NovoRender.md).[Internal](../namespaces/NovoRender.Internal.md).CameraExt

## Hierarchy

- [`Camera`](NovoRender.Camera.md)

  ↳ **`CameraExt`**

## Properties

### controller

• **controller**: [`CameraController`](NovoRender.CameraController.md)

Get or set the motion controller assigned to this camera. By default, this will be a static controller, whose only function is to provide a reasonable default view for a given scene.

#### Inherited from

[Camera](NovoRender.Camera.md).[controller](NovoRender.Camera.md#controller)

___

### far

• **far**: `number`

Distance to the view frustum far clipping plane.

**`remarks`**
 The value must be larger than [near](NovoRender.Internal.CameraExt.md#near) and and large enough to include the desired maximum viewing distance, which typically is some multiple of the scene size.
 Camera controllers will automatically adjust this value whenever a new scene is assigned to their view, so setting it manually is generally not required.
 See [https://en.wikipedia.org/wiki/Viewing_frustum](https://en.wikipedia.org/wiki/Viewing_frustum) for more details.

#### Inherited from

[Camera](NovoRender.Camera.md).[far](NovoRender.Camera.md#far)

___

### fieldOfView

• **fieldOfView**: `number`

Field of view expressed as the vertical viewing angle in degrees for pinhole cameras, or vertical aperature dimension in meters for orthographic cameras.

#### Inherited from

[Camera](NovoRender.Camera.md).[fieldOfView](NovoRender.Camera.md#fieldofview)

___

### generation

• `Readonly` **generation**: `number`

___

### hasChanged

• `Readonly` **hasChanged**: `boolean`

___

### kind

• `Readonly` **kind**: ``"pinhole"`` \| ``"orthographic"``

Camera type.

#### Inherited from

[Camera](NovoRender.Camera.md).[kind](NovoRender.Camera.md#kind)

___

### near

• **near**: `number`

Distance to the view frustum near clipping plane.

**`remarks`**
 The value must be larger than 0 and preferably as large as possible without creating undesired clipping effects near the camera.
 Camera controllers will automatically adjust this value whenever a new scene is assigned to their view, so setting it manually is generally not required.
 See [https://en.wikipedia.org/wiki/Viewing_frustum](https://en.wikipedia.org/wiki/Viewing_frustum) for more details.

#### Inherited from

[Camera](NovoRender.Camera.md).[near](NovoRender.Camera.md#near)

___

### position

• `Readonly` **position**: `vec3`

Camera position expressed as a world space 3D vector.

#### Inherited from

[Camera](NovoRender.Camera.md).[position](NovoRender.Camera.md#position)

___

### rotation

• `Readonly` **rotation**: `quat`

Camera orientation expressed as a world space 3D quaternion.

#### Inherited from

[Camera](NovoRender.Camera.md).[rotation](NovoRender.Camera.md#rotation)

___

### view

• `Readonly` **view**: [`View`](NovoRender.View.md)

The view to which this camera belongs.

#### Inherited from

[Camera](NovoRender.Camera.md).[view](NovoRender.Camera.md#view)

## Methods

### getDistanceFromViewPlane

▸ **getDistanceFromViewPlane**(`point`): `number`

#### Parameters

| Name | Type |
| :------ | :------ |
| `point` | `ReadonlyVec3` |

#### Returns

`number`

#### Inherited from

[Camera](NovoRender.Camera.md).[getDistanceFromViewPlane](NovoRender.Camera.md#getdistancefromviewplane)
