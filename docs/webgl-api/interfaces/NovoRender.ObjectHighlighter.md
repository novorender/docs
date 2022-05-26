---
id: "NovoRender.ObjectHighlighter"
title: "Interface: ObjectHighlighter"
sidebar_label: "ObjectHighlighter"
custom_edit_url: null
---

[NovoRender](../namespaces/NovoRender.md).ObjectHighlighter

Visual highlighting for groups of objects.

**`remarks`**
This interface is used to highlight or hide sets of objects, based e.g. on interactive selections or queries.
Each 3D object in the scene has a unique id/index, which can be assigned to one of the available highlight groups.
By default, all objects are assigned to group #0.
To change a highlight for a specific object or set of objects, simply change the {@link objectGroups} index for that/this object id(s):
`objectHighlights[objectId] = newHighlightGroupIndex`.

Highlight index 255/0xff is reserved and used to hide objects.
Although you can also hide objects by making them 100% transparent (opacity = 0), assigning them to index 255 is more performant.

Changes to object highlights does not become visible until you call the [commit](NovoRender.ObjectHighlighter.md#commit) method.

## Properties

### objectHighlightIndices

• `Readonly` **objectHighlightIndices**: `Uint8Array`

Indexed collection of groups.

## Methods

### commit

▸ **commit**(): `Promise`<`void`\>

Commit changes for rendering.

#### Returns

`Promise`<`void`\>
