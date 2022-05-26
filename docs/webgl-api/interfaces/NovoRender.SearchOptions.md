---
id: "NovoRender.SearchOptions"
title: "Interface: SearchOptions"
sidebar_label: "SearchOptions"
custom_edit_url: null
---

[NovoRender](../namespaces/NovoRender.md).SearchOptions

Search object options

## Properties

### descentDepth

• `Optional` **descentDepth**: `number`

How many generations of descendants to include in search.

**`remarks`**
0 - object itself

1 - children only

undefined - deepest levels.

___

### full

• `Optional` **full**: `boolean`

Preload all matching objects.

**`remarks`**
This param should be set if you want to access some parameters of all results later to prevent per object data request.

___

### parentPath

• `Optional` **parentPath**: `string`

Path to search start from.

**`remarks`**
Path is similar to filesystem file/folder hierarchical paths, e.g. my_folder/my_object.
Paths reflect original CAD model hierarchy (.ifc, .rvm, etc).
Only objects contained within specified folder will be returned.

___

### searchPattern

• `Optional` **searchPattern**: `string` \| [`SearchPattern`](NovoRender.SearchPattern.md)[]

Property pattern to search for.
