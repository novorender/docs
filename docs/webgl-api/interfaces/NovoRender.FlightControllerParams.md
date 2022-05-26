---
id: "NovoRender.FlightControllerParams"
title: "Interface: FlightControllerParams"
sidebar_label: "FlightControllerParams"
custom_edit_url: null
---

[NovoRender](../namespaces/NovoRender.md).FlightControllerParams

Flight type camera motion controller

## Properties

### autoZoomSpeed

• `Optional` **autoZoomSpeed**: `boolean`

The allow automatic zoom velocity according last pivot point distance

___

### far

• `Optional` **far**: `number`

Far camera clipping distance

___

### fieldOfView

• `Optional` **fieldOfView**: `number`

Camera Field of View in degrees

___

### flightTime

• `Optional` **flightTime**: `number`

Camera flight time in zoomTo

___

### kind

• **kind**: ``"flight"``

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

### pitch

• `Optional` **pitch**: `number`

The current pitch of camera in degrees (+/-90)

___

### pivotPoint

• `Optional` **pivotPoint**: ``false`` \| `vec3`

The world space coordinate to orbit around. (0,0,0) is default.

___

### position

• `Optional` **position**: `vec3`

The world space coordinate of camera. (0,0,0) is default.

___

### yaw

• `Optional` **yaw**: `number`

The current yaw of camera in degrees (+/-180)
