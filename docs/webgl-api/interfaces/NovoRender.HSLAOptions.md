---
id: "NovoRender.HSLAOptions"
title: "Interface: HSLAOptions"
sidebar_label: "HSLAOptions"
custom_edit_url: null
---

[NovoRender](../namespaces/NovoRender.md).HSLAOptions

Options for HSL + alpha color transformation.

**`remarks`**
All input values are between 0 and 1.
See [Wikipedia](https://en.wikipedia.org/wiki/HSL_and_HSV) for more details on the HSV color space.

## Properties

### lightness

• `Readonly` **lightness**: `number` \| [`LinearTransform`](NovoRender.LinearTransform.md)

Lightness adjustment.

___

### opacity

• `Readonly` **opacity**: `number` \| [`LinearTransform`](NovoRender.LinearTransform.md)

Opacity/alpha adjustment.

___

### saturation

• `Readonly` **saturation**: `number`

Saturation adjustment (scale).
