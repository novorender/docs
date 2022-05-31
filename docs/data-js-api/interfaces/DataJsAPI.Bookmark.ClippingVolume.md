---
id: "DataJsAPI.Bookmark.ClippingVolume"
title: "Interface: ClippingVolume"
sidebar_label: "ClippingVolume"
custom_edit_url: null
---

[DataJsAPI](../namespaces/DataJsAPI.md).[Bookmark](../namespaces/DataJsAPI.Bookmark.md).ClippingVolume

Clipping volume settings.

**`remarks`**
Clipping volume allows for a set of up to 6 planes to define a volume that excluded from rendering.
This is useful for rendering various cross sections and revealing internal geometry.

## Properties

### enabled

• **enabled**: `boolean`

Whether to clip geometry by the actual bounding box or not.

___

### mode

• **mode**: ``"intersection"`` \| ``"union"``

How multiple clipping planes are combined. Default: "union"

___

### planes

• **planes**: readonly `any`[]

List of clipping planes (max 6), expressed as plane normal (x,y,z) and offset from origo (w) in a 4D world space vector.
