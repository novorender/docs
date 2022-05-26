---
id: "NovoRender.RenderSettings"
title: "Interface: RenderSettings"
sidebar_label: "RenderSettings"
custom_edit_url: null
---

[NovoRender](../namespaces/NovoRender.md).RenderSettings

Render settings

**`remarks`**
These settings controls various visual aspects of the 3D view.

## Hierarchy

- **`RenderSettings`**

  ↳ [`RenderSettingsExt`](NovoRender.Internal.RenderSettingsExt.md)

## Properties

### background

• `Readonly` **background**: `Object`

Settings for rendering of background.

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `color` | `ReadonlyVec4` | Background color.  **`remarks`** Setting the alpha component < 1 will generate a transparent background. If undefined, background will use image from environment map, or default color if no environment is set. |

___

### clippingPlanes

• `Readonly` **clippingPlanes**: `Object`

Clipping planes settings.

**`deprecated`** Use clippingVolume instead.

**`remarks`**
Clipping planes allows for an axis alligned box to define what volume will be rendered or not.
This is useful for rendering various cross sections and revealing internal geometry.

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `bounds` | [`AABB`](NovoRender.AABB.md) | The axis aligned bounding volume. |
| `enabled` | `boolean` | Whether to clip geometry by the actual bounding box or not. |
| `highlight` | `number` | Highlighted side. |
| `inside` | `boolean` | Whether to clip geometry inside or outside the actual bounding box. |
| `showBox` | `boolean` | Whether to show the actual bounding box or not. |

___

### clippingVolume

• `Readonly` **clippingVolume**: `Object`

Clipping volume settings.

**`remarks`**
Clipping volume allows for a set of up to 6 planes to define a volume that excluded from rendering.
This is useful for rendering various cross sections and revealing internal geometry.

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `enabled` | `boolean` | Whether to clip geometry by the actual bounding box or not. |
| `mode` | ``"intersection"`` \| ``"union"`` | How multiple clipping planes are combined. Default: "union" |
| `planes` | readonly `ReadonlyVec4`[] | List of clipping planes (max 6), expressed as plane normal (x,y,z) and offset from origo (w) in a 4D world space vector. |

___

### display

• `Readonly` **display**: `Object`

Display settings

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `height` | `number` | Display height in pixels. |
| `width` | `number` | Display width in pixels. |

___

### environment

• `Optional` **environment**: [`Environment`](NovoRender.Environment.md)

Current background/IBL environment.

**`remarks`**
Environments are a pre-baked set of textures for background and lighting information.
For retrieving a list of available environments, see [API.availableEnvironments](NovoRender.API.md#availableenvironments).
An environment must be loaded before it can be assigned here, via {@link View.loadEnvironment}.
Assigning an environment impacts lighting if no {@link light.sun} is defined, and also background images [background](NovoRender.RenderSettings.md#background) if no color is defined.
Image based lighting (IBL) uses light information from HDRI panoramic images to create a more natural looking light and ambience.
If undefined, a basic directional sun lighting model will be used instead, allowing for dynamic changes in light color and direction at the expense of esthetics.

___

### exposure

• `Optional` **exposure**: `number`

Camera light exposure as stops of power of 2.

**`remarks`**
Negative values darkens the image, while positive ones brightens it.
The default value is 0.0.

___

### grid

• `Readonly` **grid**: `Object`

Grid settings

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `axisX` | `vec3` | X axis of the grid, length determines the distance between lines |
| `axisY` | `vec3` | Y axis of the grid, length determines the distance between lines |
| `enabled` | `boolean` | Enable grid plane. |
| `majorColor` | `ReadonlyVec3` | Color of major grid lines |
| `majorLineCount` | `number` | Number of major lines, odd number needed to have lines go through origo. |
| `minorColor` | `ReadonlyVec3` | Color of minor grid lines |
| `minorLineCount` | `number` | Number of minor lines between major lines. |
| `origo` | `vec3` | Origo of the grid |

___

### light

• `Readonly` **light**: `Object`

Light settings

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `ambient` | { `brightness`: `number`  } | Ambient hemisphere light, emulating indirect light scattered from atmosphere. |
| `ambient.brightness` | `number` | Brightness expressed as a scalar from 0.0 (none), to 1.0 (max). |
| `camera` | { `brightness`: `number` ; `distance`: `number`  } | Camera local light. |
| `camera.brightness` | `number` | Brightness expressed as a scalar from 0.0 (none), to 1.0 (bright). |
| `camera.distance` | `number` | Fall-off distance, beyond which this light is effectively disabled. |
| `sun` | { `brightness`: `number` ; `position`: { `azimuth`: `number` ; `inclination`: `number`  } ; `time?`: `Date`  } | Direct sunlight. |
| `sun.brightness` | `number` | Brightness expressed as a scalar from 0.0 (none), to 1.0 (sunny). |
| `sun.position` | { `azimuth`: `number` ; `inclination`: `number`  } | Sun position on the sky. |
| `sun.position.azimuth` | `number` | Solar azimuth angle in degrees, where 0° is due north, 90° is due east and 270° due west. |
| `sun.position.inclination` | `number` | Solar elevation angle in degrees, where 0° at the horizon and 90° is straight up. |
| `sun.time?` | `Date` | If set then sun [position](NovoRender.DynamicObject.md#position) on the sky will be calculated automatically based on scene [Scene.location](NovoRender.Scene.md#location), [Scene.timezone](NovoRender.Scene.md#timezone) and this time. |

___

### objectHighlights

• **objectHighlights**: readonly [`Highlight`](NovoRender.Highlight.md)[]

Color transforms for various highlighting groups.

**`remarks`**
These highlights are used by the {@link scene.objectHighlighter}.
Modifing the highlights is done by assigning a new array, rather than mutating the existing one.
The maximum number of highlights supported is currently 256, whereof the last (255) is reserved for hidden objects.
The highlight at index 0 is the initial default for all objects and can be used to e.g. highlight all objects that are not selected or otherwise part of another highlighting group.

___

### ocean

• `Readonly` **ocean**: `Object`

Ocean render settings

**`remarks`**
If undefined, ocean geometry will not be rendered.

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `color` | `ReadonlyVec3` | Ocean color |
| `enabled` | `boolean` | Enable ocean rendering (default false). |
| `opacity` | `number` | Ocean opacity (default 0.5). |

___

### points

• `Readonly` **points**: `Object`

Point cloud settings.

**`remarks`**
The sizes are cumulative and computed as follows:
``effective_point_pixel_size = max(1, pixelSize + projectedSizeOf(metricSize + tolerance * toleranceFactor))``.
Metric size is projected as a 3D sphere at the point origo to deterine pixel size.
The term pixel refers to the size of a pixel in the target canvas element, which resolution may differ from that of the render buffer.

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `deviation` | { `colors`: readonly [`DeviationColorGradientNode`](NovoRender.DeviationColorGradientNode.md)[] ; `mode`: ``"on"`` \| ``"off"`` \| ``"mix"``  } | - |
| `deviation.colors` | readonly [`DeviationColorGradientNode`](NovoRender.DeviationColorGradientNode.md)[] | - |
| `deviation.mode` | ``"on"`` \| ``"off"`` \| ``"mix"`` | - |
| `intensity` | { `colors`: readonly [`IntensityColorGradientNode`](NovoRender.IntensityColorGradientNode.md)[] ; `mode`: ``"on"`` \| ``"off"`` \| ``"mix"``  } | - |
| `intensity.colors` | readonly [`IntensityColorGradientNode`](NovoRender.IntensityColorGradientNode.md)[] | - |
| `intensity.mode` | ``"on"`` \| ``"off"`` \| ``"mix"`` | - |
| `shape` | ``"disc"`` \| ``"square"`` | Point shape. Default is "disc". |
| `size` | { `maxPixel`: `number` ; `metric`: `number` ; `pixel`: `number` ; `toleranceFactor`: `number`  } | - |
| `size.maxPixel` | `number` | Max point size in pixels. |
| `size.metric` | `number` | Point size in meters. |
| `size.pixel` | `number` | Point size in pixels. |
| `size.toleranceFactor` | `number` | The scaling factor for applying the tolerance of the current level of detail to point size.  **`remarks`** Different levels of detail (LOD) will have different point densities. Taking this difference into account may result in a more uniform point coverage and visually pleasing result. The tolerance of each LOD reflects the point merging distance threshold in meters used to reduce # points, or 0 for the original level of detail. |

___

### quality

• `Readonly` **quality**: `Object`

Render quality settings for adjusting performance to various devices

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `detail` | { `autoAdjust`: { `enabled`: `boolean` ; `max`: `number` ; `min`: `number`  } ; `maxLodTextureBytes?`: `number` ; `maxLodTriangles?`: `number` ; `value`: `number`  } | Geometry detail settings. |
| `detail.autoAdjust` | { `enabled`: `boolean` ; `max`: `number` ; `min`: `number`  } | Auto adjustment based on current device's rendering performance. |
| `detail.autoAdjust.enabled` | `boolean` | Is automatic adjustment enabled? |
| `detail.autoAdjust.max` | `number` | Upper bound for automatic adjustment. |
| `detail.autoAdjust.min` | `number` | Lower bound for automatic adjustment. |
| `detail.maxLodTextureBytes?` | `number` | Max limit for # of bytes used for textures in static LOD geometry.  **`remarks`**  Adjust this to accomodate memory constraints on your device.  Default value is undefined, which disables enforcement of this limit.  The # bytes refers to the textxure image and does not include memory used for mipmapping or device specific format conversions.  Hardware compressed textures only count for the compressed byte size.  Textures from DynamicObjects are not included in the triangle count and thus not contrained by this value. |
| `detail.maxLodTriangles?` | `number` | Max limit for # of triangles used for static LOD geometry.  **`remarks`**  Adjust this to enforce memory and performance constraints on your device.  Default value is undefined, which disables enforcement of this limit.  Triangles from DynamicObjects are not included in the triangle count and thus not contrained by this value. |
| `detail.value` | `number` | Level of geometry detail. 1.0 = reasonable default, >1 more detail, <1 less detail. |
| `resolution` | { `autoAdjust`: { `enabled`: `boolean` ; `max`: `number` ; `min`: `number`  } ; `value`: `number`  } | Resolution settings. |
| `resolution.autoAdjust` | { `enabled`: `boolean` ; `max`: `number` ; `min`: `number`  } | Auto adjustment based on current device's rendering performance. |
| `resolution.autoAdjust.enabled` | `boolean` | Is automatic adjustment enabled? |
| `resolution.autoAdjust.max` | `number` | Upper bound for automatic adjustment. |
| `resolution.autoAdjust.min` | `number` | Lower bound for automatic adjustment. |
| `resolution.value` | `number` | Level of pixel resolution, where 1.0 = 1:1 ratio (default) and values lesser than 1 will render in lower resolution than screen and scale up for increased performance. |

___

### terrain

• **terrain**: `Object`

Terrain render settings

**`remarks`**
If undefined, terrain geometry will not be rendered.

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `asBackground` | `boolean` | Draw terrain as background |
| `elevationColors` | readonly [`ElevationColorGradientNode`](NovoRender.ElevationColorGradientNode.md)[] | Elevation gradient color curve, defined by a list of nodes.  **`remarks`** Nodes must be sorted in ascending order of elevation! Elevations are defined as in meters above/below sea level (using negative values for sub sea terrain). At least two nodes are required for any sort of gradient. Nodes do not have to be uniformly distributed elevation-wise. To create a discontinuity in the gradient, two adjacent nodes with identical elevation, but different colors may be used. Any elevation outside the min/max range defined by this list will be clamped to the color of the nearest node (min or max), i.e., no extrapolation will occur. |
