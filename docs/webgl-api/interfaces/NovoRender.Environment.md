---
id: "NovoRender.Environment"
title: "Interface: Environment"
sidebar_label: "Environment"
custom_edit_url: null
---

[NovoRender](../namespaces/NovoRender.md).Environment

An in-memory instance of an environment, ready for rendering.

## Properties

### id

• `Readonly` **id**: `number`

Loaded environment id.

## Methods

### dispose

▸ **dispose**(): `Promise`<`void`\>

Unload environment instance and release all resources.

**`remarks`**
It is safe to call this function on an environment if it's currently not assigned to any view, or if all assigned views have rendered it at least once.

#### Returns

`Promise`<`void`\>
