---
id: "DataJsAPI.APIOptions"
title: "Interface: APIOptions"
sidebar_label: "APIOptions"
custom_edit_url: null
---

[DataJsAPI](../namespaces/DataJsAPI.md).APIOptions

Server API creation options

## Properties

### serviceUrl

• `Optional` **serviceUrl**: `string`

Service url. e.g. "https://novorender.com".

## Methods

### authHeader

▸ `Optional` **authHeader**(): `Promise`<[`AuthenticationHeader`](DataJsAPI.AuthenticationHeader.md)\>

Callback returning [AuthenticationHeader](DataJsAPI.AuthenticationHeader.md) promise for protected api requests.

#### Returns

`Promise`<[`AuthenticationHeader`](DataJsAPI.AuthenticationHeader.md)\>
