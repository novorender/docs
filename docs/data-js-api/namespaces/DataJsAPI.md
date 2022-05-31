---
id: "DataJsAPI"
title: "Namespace: DataJsAPI"
sidebar_label: "DataJsAPI"
sidebar_position: 0
custom_edit_url: null
---

## Namespaces

- [Bookmark](DataJsAPI.Bookmark.md)

## Enumerations

- [AccessType](../enums/DataJsAPI.AccessType.md)

## Interfaces

- [API](../interfaces/DataJsAPI.API.md)
- [APIOptions](../interfaces/DataJsAPI.APIOptions.md)
- [ActiveProcess](../interfaces/DataJsAPI.ActiveProcess.md)
- [AuthenticationHeader](../interfaces/DataJsAPI.AuthenticationHeader.md)
- [Bookmark](../interfaces/DataJsAPI.Bookmark-1.md)
- [MeasureObjectPoint](../interfaces/DataJsAPI.MeasureObjectPoint.md)
- [ObjectGroup](../interfaces/DataJsAPI.ObjectGroup.md)
- [ProcessProgress](../interfaces/DataJsAPI.ProcessProgress.md)
- [Resource](../interfaces/DataJsAPI.Resource.md)
- [ResourcePreview](../interfaces/DataJsAPI.ResourcePreview.md)
- [SceneData](../interfaces/DataJsAPI.SceneData.md)
- [SceneDefinition](../interfaces/DataJsAPI.SceneDefinition.md)
- [SceneLoadFail](../interfaces/DataJsAPI.SceneLoadFail.md)
- [ScenePreview](../interfaces/DataJsAPI.ScenePreview.md)

## Functions

### createAPI

▸ **createAPI**(`options?`): [`API`](../interfaces/DataJsAPI.API.md)

Create an instance of the NovoRender Server API.

**`remarks`**
The Server API requires that a user with appropriate access to server resources has already been logged in.
Unless you are developing a purely public web app, you may want to check the credentials property in the returned API and redirect to a login page if need be.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `options?` | [`APIOptions`](../interfaces/DataJsAPI.APIOptions.md) | Custom settings {@link ServerAPIOptions} to create API. |

#### Returns

[`API`](../interfaces/DataJsAPI.API.md)

An initialized API object
