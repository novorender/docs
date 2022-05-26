---
id: "NovoRender.DuoMeasurementValues"
title: "Interface: DuoMeasurementValues"
sidebar_label: "DuoMeasurementValues"
custom_edit_url: null
---

[NovoRender](../namespaces/NovoRender.md).DuoMeasurementValues

DuoMeasurementValues is a collection of values for measuring two objects

## Properties

### distance

• `Optional` **distance**: `number`

Total distance between the objects

___

### distanceX

• **distanceX**: `number`

Distance on the X plane between the objects

___

### distanceY

• **distanceY**: `number`

Distance on the Y plane between the objects

___

### distanceZ

• **distanceZ**: `number`

Distance on the Z plane between the objects

___

### normalDistance

• `Optional` **normalDistance**: `number`

Total normdistance between the objects from object A

___

### normalPoints

• `Optional` **normalPoints**: `vec3`[]

Point to display normal distance between objects from object A

___

### pointA

• `Optional` **pointA**: `vec3`

Closest point on object A

___

### pointB

• `Optional` **pointB**: `vec3`

Closest point on object B

___

### validMeasureSettings

• `Optional` **validMeasureSettings**: `Object`

The valid measurement settings for the current measure objects A and B

#### Type declaration

| Name | Type |
| :------ | :------ |
| `a` | `boolean` |
| `b` | `boolean` |
