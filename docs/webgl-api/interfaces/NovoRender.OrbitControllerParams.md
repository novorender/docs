---
id: "NovoRender.OrbitControllerParams"
title: "Interface: OrbitControllerParams"
sidebar_label: "OrbitControllerParams"
custom_edit_url: null
---

[NovoRender](../namespaces/NovoRender.md).OrbitControllerParams

Orbit type camera motion controller

## Properties

### distance

• `Optional` **distance**: `number`

The camera distance relative to pivot point in meters.

___

### kind

• **kind**: ``"orbit"``

The kind of camera controller.

___

### linearVelocity

• `Optional` **linearVelocity**: `number`

The velocity with which the camera moves through space in meters/second

___

### maxDistance

• `Optional` **maxDistance**: `number`

The camera distance relative to pivot point in meters.

___

### pitch

• `Optional` **pitch**: `number`

The current pitch of camera in degrees (+/-90)

___

### pivotPoint

• `Optional` **pivotPoint**: `vec3`

The world space coordinate to orbit around. (0,0,0) is default.

___

### rotationalVelocity

• `Optional` **rotationalVelocity**: `number`

The velocity with which the camera rotates in degrees/second.

___

### yaw

• `Optional` **yaw**: `number`

The current yaw of camera in degrees (+/-180)
