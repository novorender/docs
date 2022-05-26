---
id: "NovoRender.PerformanceStatistics"
title: "Interface: PerformanceStatistics"
sidebar_label: "PerformanceStatistics"
custom_edit_url: null
---

[NovoRender](../namespaces/NovoRender.md).PerformanceStatistics

Rendering performance statistics

## Properties

### cameraGeneration

• **cameraGeneration**: `number`

Camera generation

___

### cpuTime

• **cpuTime**: `Object`

# milliseconds spent on various aspects of rendering last frame.

#### Type declaration

| Name | Type |
| :------ | :------ |
| `animation` | `number` |
| `geometry` | { `update`: `number`  } |
| `geometry.update` | `number` |
| `render` | { `draw`: `number` ; `total`: `number` ; `update`: `number`  } |
| `render.draw` | `number` |
| `render.total` | `number` |
| `render.update` | `number` |

___

### drawCalls

• **drawCalls**: `number`

# draw calls emitted in last frame.

___

### points

• **points**: `number`

# Points rendered in last frame.

___

### renderResolved

• **renderResolved**: `boolean`

Are all pending nodes update done in rendering pipeline?

___

### sceneResolved

• **sceneResolved**: `boolean`

Are all pending nodes loaded and sent to rendering pipeline?

___

### triangles

• **triangles**: `number`

# Triangles rendered in last frame.

___

### weakDevice

• **weakDevice**: `boolean`

Is device weak in rendering performance?
