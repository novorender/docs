---
id: "NovoRender.PlaneValues"
title: "Interface: PlaneValues"
sidebar_label: "PlaneValues"
custom_edit_url: null
---

[NovoRender](../namespaces/NovoRender.md).PlaneValues

PlaneValues is a collection of values for measuring a single Plane

## Properties

### area

• `Optional` **area**: `number`

Calculated area of the plane

___

### height

• `Optional` **height**: `number`

Height of the plane

___

### heightAboveXyPlane

• `Optional` **heightAboveXyPlane**: `number`

Y value of the plane origin

___

### innerEdges

• **innerEdges**: [`EdgeValues`](../namespaces/NovoRender.md#edgevalues)[][]

Inner edges of the plane

___

### innerRadius

• `Optional` **innerRadius**: `number`

Largest inner radius of the plane in case of only arcs

___

### kind

• **kind**: ``"plane"``

___

### normal

• **normal**: `vec3`

Normal of the plane

___

### outerEdges

• **outerEdges**: [`EdgeValues`](../namespaces/NovoRender.md#edgevalues)[]

Outer edges of the plane

___

### outerRadius

• `Optional` **outerRadius**: `number`

Largest outer radius of the plane in case of only arcs

___

### vertices

• **vertices**: `vec3`[]

Corner vertices of the plane

___

### width

• `Optional` **width**: `number`

Width of the plane
