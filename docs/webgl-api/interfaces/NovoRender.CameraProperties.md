---
id: "NovoRender.CameraProperties"
title: "Interface: CameraProperties"
sidebar_label: "CameraProperties"
custom_edit_url: null
---

[NovoRender](../namespaces/NovoRender.md).CameraProperties

## Hierarchy

- **`CameraProperties`**

  ↳ [`Camera`](NovoRender.Camera.md)

## Properties

### far

• **far**: `number`

Distance to the view frustum far clipping plane.

**`remarks`**
 The value must be larger than [near](NovoRender.CameraProperties.md#near) and and large enough to include the desired maximum viewing distance, which typically is some multiple of the scene size.
 Camera controllers will automatically adjust this value whenever a new scene is assigned to their view, so setting it manually is generally not required.
 See [https://en.wikipedia.org/wiki/Viewing_frustum](https://en.wikipedia.org/wiki/Viewing_frustum) for more details.

___

### fieldOfView

• **fieldOfView**: `number`

Field of view expressed as the vertical viewing angle in degrees for pinhole cameras, or vertical aperature dimension in meters for orthographic cameras.

___

### kind

• `Readonly` **kind**: ``"pinhole"`` \| ``"orthographic"``

Camera type.

___

### near

• **near**: `number`

Distance to the view frustum near clipping plane.

**`remarks`**
 The value must be larger than 0 and preferably as large as possible without creating undesired clipping effects near the camera.
 Camera controllers will automatically adjust this value whenever a new scene is assigned to their view, so setting it manually is generally not required.
 See [https://en.wikipedia.org/wiki/Viewing_frustum](https://en.wikipedia.org/wiki/Viewing_frustum) for more details.

___

### position

• `Readonly` **position**: `vec3`

Camera position expressed as a world space 3D vector.

___

### rotation

• `Readonly` **rotation**: `quat`

Camera orientation expressed as a world space 3D quaternion.
