---
id: "NovoRender.OrthoControllerParams"
title: "Interface: OrthoControllerParams"
sidebar_label: "OrthoControllerParams"
custom_edit_url: null
---

[NovoRender](../namespaces/NovoRender.md).OrthoControllerParams

Flight type camera motion controller

## Properties

### far

• `Optional` **far**: `number`

Far camera clipping distance

___

### fieldOfView

• `Optional` **fieldOfView**: `number`

Camera (vertical) field of view in meters.

___

### kind

• **kind**: ``"ortho"``

The kind of camera controller.

___

### linearVelocity

• `Optional` **linearVelocity**: `number`

The velocity with which the camera moves through space in meters/second

___

### near

• `Optional` **near**: `number`

Near camera clipping distance

___

### position

• `Optional` **position**: `vec3`

The position in the reference coordinate system. (0,0,0) is default.

___

### referenceCoordSys

• `Optional` **referenceCoordSys**: `ReadonlyMat4`

The world space reference coordinate system to move along. Identity matrix is default.
