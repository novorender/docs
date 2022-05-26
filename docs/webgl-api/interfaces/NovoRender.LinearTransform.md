---
id: "NovoRender.LinearTransform"
title: "Interface: LinearTransform"
sidebar_label: "LinearTransform"
custom_edit_url: null
---

[NovoRender](../namespaces/NovoRender.md).LinearTransform

Linear transform options.

**`remarks`**
The transform is performed by first applying scale, then adding offset, i.e.: result = value * scale + offset.
If scale = 0, offset will effectively replace input value.

## Properties

### offset

• `Optional` `Readonly` **offset**: `number`

Addend for scaled input value. Default = 0.

___

### scale

• `Optional` `Readonly` **scale**: `number`

Multiplicand for input value. Default = 1.
