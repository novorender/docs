---
id: "NovoRender.Internal.CameraControllerExt"
title: "Interface: CameraControllerExt"
sidebar_label: "CameraControllerExt"
custom_edit_url: null
---

[NovoRender](../namespaces/NovoRender.md).[Internal](../namespaces/NovoRender.Internal.md).CameraControllerExt

## Hierarchy

- [`CameraController`](NovoRender.CameraController.md)

  ↳ **`CameraControllerExt`**

## Properties

### autoZoomToScene

• `Optional` **autoZoomToScene**: `boolean`

Whether to automatically zoom to scene extents when new scene is selected. Default is true.

#### Inherited from

[CameraController](NovoRender.CameraController.md).[autoZoomToScene](NovoRender.CameraController.md#autozoomtoscene)

___

### enabled

• **enabled**: `boolean`

Whether controller is enabled. Default is true.

#### Inherited from

[CameraController](NovoRender.CameraController.md).[enabled](NovoRender.CameraController.md#enabled)

___

### fingersMap

• **fingersMap**: `Object`

Defines touch fingers actions.

**`param`** defines how many fingers will rotate, pan and orbit camera.

**`remarks`**
Default value: { rotate: 1, pan: 3, orbit: 3, pivot: 3 }
rotate, pan and orbit are movement while holding fingers
pivot is setting of pivot point for orbit rotation
You could disable some action by do not set it or set to 0, like { rotate: 1, pan: 2 } or { rotate: 1, pan: 2, orbit: 0}

#### Type declaration

| Name | Type |
| :------ | :------ |
| `orbit` | `number` |
| `pan` | `number` |
| `pivot` | `number` |
| `rotate` | `number` |

#### Inherited from

[CameraController](NovoRender.CameraController.md).[fingersMap](NovoRender.CameraController.md#fingersmap)

___

### mouseButtonsMap

• **mouseButtonsMap**: `Object`

Defines mouse buttons actions.

**`param`** Bitmask definition what buttons will rotate, pan and orbit camera.

**`remarks`**
Bit mask of buttons:
1 - left button.
2 - right button.
4 - middle button.
Default value: { rotate: 1, pan: 4, orbit: 2, pivot: 2 }
rotate, pan and orbit are movement while button hold
pivot is setting of pivot point for orbit rotation on button down
You could disable some action by do not set it or set to 0, like { rotate: 1, pan: 2 } or { rotate: 1, pan: 2, orbit: 0}
Here could be combination of buttons, for example if you want use right button for rotation and left or middle button for panning and no orbit then value should be { rotate: 2, pan: 5 }

#### Type declaration

| Name | Type |
| :------ | :------ |
| `orbit` | `number` |
| `pan` | `number` |
| `pivot` | `number` |
| `rotate` | `number` |

#### Inherited from

[CameraController](NovoRender.CameraController.md).[mouseButtonsMap](NovoRender.CameraController.md#mousebuttonsmap)

___

### params

• `Readonly` **params**: `Required`<[`CameraControllerParams`](../namespaces/NovoRender.md#cameracontrollerparams)\>

Controller parameters

#### Inherited from

[CameraController](NovoRender.CameraController.md).[params](NovoRender.CameraController.md#params)

## Methods

### connect

▸ **connect**(): `void`

#### Returns

`void`

___

### disconnect

▸ **disconnect**(): `void`

#### Returns

`void`

___

### moveTo

▸ **moveTo**(`position`, `rotation`): `void`

Move camera to exact position and rotation.

#### Parameters

| Name | Type |
| :------ | :------ |
| `position` | `vec3` |
| `rotation` | `quat` |

#### Returns

`void`

#### Inherited from

[CameraController](NovoRender.CameraController.md).[moveTo](NovoRender.CameraController.md#moveto)

___

### reset

▸ **reset**(): `void`

#### Returns

`void`

___

### update

▸ **update**(`camera`, `sceneVolume`, `deltaTime`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `camera` | [`Camera`](NovoRender.Camera.md) |
| `sceneVolume` | [`BoundingSphere`](NovoRender.BoundingSphere.md) |
| `deltaTime` | `number` |

#### Returns

`void`

___

### zoomTo

▸ **zoomTo**(`bounds`): `void`

Zoom to area of interest.

**`remarks`**
Bounding volumes can be gotten from the scene itself, or an selection of objects within the scene.
A typical case is to update the 3D view to reflect some object selection.
The controller will attempt to position the camera at a reasonable distance from the specified volume, using its center as the focal point.
The controller will not attempt to avoid moving through walls etc.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `bounds` | [`BoundingSphere`](NovoRender.BoundingSphere.md) | The bounding volume that should be brought into view. |

#### Returns

`void`

#### Inherited from

[CameraController](NovoRender.CameraController.md).[zoomTo](NovoRender.CameraController.md#zoomto)
