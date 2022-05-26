---
id: "NovoRender.TurntableControllerParams"
title: "Interface: TurntableControllerParams"
sidebar_label: "TurntableControllerParams"
custom_edit_url: null
---

[NovoRender](../namespaces/NovoRender.md).TurntableControllerParams

Turntable camera motion controller parameters.

## Properties

### distance

• `Optional` **distance**: `number`

The camera distance relative to pivot point in meters.

___

### elevation

• `Optional` **elevation**: `number`

The camera elevation relative to pivot point in meters.

___

### kind

• **kind**: ``"turntable"``

The kind of camera controller.

___

### pivotPoint

• `Optional` **pivotPoint**: `vec3`

The world space coordinate to orbit around.

___

### rotation

• `Optional` **rotation**: `number`

The current turntable rotation angle in degrees (+/-180)

___

### rotationalVelocity

• `Optional` **rotationalVelocity**: `number`

The velocity with which the camera rotates in degrees/second.
