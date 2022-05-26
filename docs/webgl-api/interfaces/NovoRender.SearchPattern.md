---
id: "NovoRender.SearchPattern"
title: "Interface: SearchPattern"
sidebar_label: "SearchPattern"
custom_edit_url: null
---

[NovoRender](../namespaces/NovoRender.md).SearchPattern

Search pattern

## Properties

### exact

• `Optional` **exact**: `boolean`

Require exact match or not.

___

### exclude

• `Optional` **exclude**: `boolean`

Exclude this match from result.
property name is mandatory

___

### property

• `Optional` **property**: `string`

Property name to find.

___

### range

• `Optional` **range**: `Object`

Range of values to search.
property name is mandatory

#### Type declaration

| Name | Type |
| :------ | :------ |
| `max` | `string` |
| `min` | `string` |

___

### value

• `Optional` **value**: `string` \| `string`[]

Value to find.
if value is array of strings then search property value should match any ("or" function) of array values
