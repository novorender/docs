---
id: "NovoRender.Highlight"
title: "Interface: Highlight"
sidebar_label: "Highlight"
custom_edit_url: null
---

[NovoRender](../namespaces/NovoRender.md).Highlight

Visual highlighting for a group of objects.

**`remarks`**
Highlighting is done using a linear transformation matrix per group, which allows for various visual effects in addition to simply assigning a single color.
This can be useful to preserve at least some aspects of the original material colors, by, e.g. making certain objects semi-transparent, darker/brighter or color/grayscale.

## Properties

### rgbaTransform

• **rgbaTransform**: { `0`: `number` ; `length`: ``20``  } & readonly `number`[]

5x4 row-major matrix for color/opacity transform.

**`remarks`**
This matrix defines the linear transformation that is applied to the original RGBA color before rendering.
The fifth column is multiplied by a constant 1, making it useful for translation.
The resulting colors are computed thus:
```
output_red = r*m[0] + g*m[1] + b*m[2] + a*m[3] + m[4]
output_green = r*m[5] + g*m[6] + b*m[7] + a*m[8] + m[9]
output_blue = r*m[10] + g*m[11] + b*m[12] + a*m[13] + m[14]
output_alpha = r*m[15] + g*m[16] + b*m[17] + a*m[18] + m[19]
```
All input values are between 0 and 1 and output value will be clamped to this range.
Setting this matrix directly offers the most amount of flexibility.
