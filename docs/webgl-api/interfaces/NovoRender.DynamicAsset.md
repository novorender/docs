---
id: "NovoRender.DynamicAsset"
title: "Interface: DynamicAsset"
sidebar_label: "DynamicAsset"
custom_edit_url: null
---

[NovoRender](../namespaces/NovoRender.md).DynamicAsset

Asset data used for dynamic objects.

**`remarks`**
Dynamic assets represents some combination of 3D geometry, textures, animations, sound and physics data.
They can then be introduced into a scene as dynamic objects, allowing multiple instances of each assets.
Assets can be imported from an existing file, such as a gltf model.

## Properties

### boundingSphere

• `Readonly` **boundingSphere**: [`BoundingSphere`](NovoRender.BoundingSphere.md)

The bounding sphere of the loaded asset.

___

### id

• `Readonly` **id**: `number`

The id assigned to this asset.

___

### url

• `Optional` `Readonly` **url**: `URL`

The url used for loading data, if any.

## Methods

### dispose

▸ **dispose**(): `void`

Dispose of asset data.

**`remarks`**
Disposing of asset data will free up associated system memory.
Doing so will make it impossible to create new dynamic objects from this asset.
Already created dynamic objects will remain, however, since they are essentially GPU memory copies.

#### Returns

`void`
