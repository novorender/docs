---
id: "DataJsAPI.ObjectGroup"
title: "Interface: ObjectGroup"
sidebar_label: "ObjectGroup"
custom_edit_url: null
---

[DataJsAPI](../namespaces/DataJsAPI.md).ObjectGroup

Scene objects group

## Properties

### color

• **color**: `any`

Group color when selected.

___

### grouping

• `Optional` **grouping**: `string`

Grouping.

___

### hidden

• **hidden**: `boolean`

Is Group hidden?

___

### id

• **id**: `string`

Object group uuid.

___

### ids

• `Optional` **ids**: `any`

List of selected object id's.

**`remarks`**
The array itself is immutable/readonly, so updates are done by assigning a new array.

___

### includeDescendants

• `Optional` **includeDescendants**: `boolean`

Include descendants.

**`remarks`**
undefined value will be interpret as true

___

### name

• **name**: `string`

Object group name.

___

### search

• `Optional` **search**: `any`[]

Group filling search criterias.

**`remarks`**
This search criterias will be used to refill ids array on scene rebuilding automatically.
If search is not defined then ids array will remain on scene rebuilding.

___

### selected

• **selected**: `boolean`

Is group selected?
