---
id: "DataJsAPI.Bookmark.ClippingPlanes"
title: "Interface: ClippingPlanes"
sidebar_label: "ClippingPlanes"
custom_edit_url: null
---

[DataJsAPI](../namespaces/DataJsAPI.md).[Bookmark](../namespaces/DataJsAPI.Bookmark.md).ClippingPlanes

Clipping planes settings.

**`remarks`**
Clipping planes allows for an axis alligned box to define what volume will be rendered or not.
This is useful for rendering various cross sections and revealing internal geometry.

## Properties

### bounds

• **bounds**: `any`

The axis aligned bounding volume.

___

### enabled

• **enabled**: `boolean`

Whether to clip geometry by the actual bounding box or not.

___

### inside

• **inside**: `boolean`

Whether to clip geometry inside or outside the actual bounding box.

___

### showBox

• **showBox**: `boolean`

Whether to show the actual bounding box or not.
