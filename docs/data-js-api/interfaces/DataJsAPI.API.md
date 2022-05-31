---
id: "DataJsAPI.API"
title: "Interface: API"
sidebar_label: "API"
custom_edit_url: null
---

[DataJsAPI](../namespaces/DataJsAPI.md).API

## Methods

### createScene

▸ **createScene**(`scene`): `Promise`<{ `error?`: `string` ; `success?`: `boolean`  }\>

Create scene

**`remarks`**
Only administrator may reate a scene.
Definition automatically saves to storage for future use.

**`throws`** Error in case of insufficient access rights.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `scene` | [`SceneDefinition`](DataJsAPI.SceneDefinition.md) | [SceneDefinition](DataJsAPI.SceneDefinition.md) |

#### Returns

`Promise`<{ `error?`: `string` ; `success?`: `boolean`  }\>

___

### deleteResource

▸ **deleteResource**(`id`): `Promise`<`boolean`\>

Delete the specified resource from cloud storage.

**`remarks`**
Only administrator may delete a resource.

**`throws`** Error in case of insufficient access rights.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `id` | `string` | The resource id (guid) |

#### Returns

`Promise`<`boolean`\>

A boolean promise indicating when the operation is complete succesfully/failed.

___

### deleteScene

▸ **deleteScene**(`id`): `Promise`<`boolean`\>

Delete the specified scene from cloud storage.

**`remarks`**
Only scene owners may delete a scene.
The scene will be permanently lost and any references to it becomes invalid.

**`throws`** Error in case of insufficient access rights.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `id` | `string` | The scene id (guid) |

#### Returns

`Promise`<`boolean`\>

A boolean promise indicating when the operation is complete succesfully/failed.

___

### fetch

▸ **fetch**(`path`, `init?`): `Promise`<`Response`\>

Relative custom path request

#### Parameters

| Name | Type |
| :------ | :------ |
| `path` | `string` |
| `init?` | `RequestInit` |

#### Returns

`Promise`<`Response`\>

___

### getBookmarks

▸ **getBookmarks**(`id`, `options?`): `Promise`<[`Bookmark`](DataJsAPI.Bookmark-1.md)[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `string` |
| `options?` | `Object` |
| `options.group?` | `string` |
| `options.personal?` | `boolean` |

#### Returns

`Promise`<[`Bookmark`](DataJsAPI.Bookmark-1.md)[]\>

___

### getGroupIds

▸ **getGroupIds**(`sceneId`, `id`): `Promise`<`number`[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `sceneId` | `string` |
| `id` | `string` |

#### Returns

`Promise`<`number`[]\>

___

### getProcessProgress

▸ **getProcessProgress**(`id`, `position?`, `signal?`): `Promise`<[`ProcessProgress`](DataJsAPI.ProcessProgress.md)\>

Get process progress

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `id` | `string` | A process id |
| `position?` | `number` | A position returned by previous process progress |
| `signal?` | `AbortSignal` | - |

#### Returns

`Promise`<[`ProcessProgress`](DataJsAPI.ProcessProgress.md)\>

State of process [ProcessProgress](DataJsAPI.ProcessProgress.md)

___

### getProcesses

▸ **getProcesses**(): `Promise`<readonly [`ActiveProcess`](DataJsAPI.ActiveProcess.md)[]\>

Get list of active processes.

#### Returns

`Promise`<readonly [`ActiveProcess`](DataJsAPI.ActiveProcess.md)[]\>

___

### getResource

▸ **getResource**(`id`): `Promise`<[`ResourcePreview`](DataJsAPI.ResourcePreview.md)\>

Get preview of the specified resource from cloud storage.

**`remarks`**
Only administrator may access resources.

**`throws`** Error in case of insufficient access rights.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `id` | `string` | The scene id (guid) |

#### Returns

`Promise`<[`ResourcePreview`](DataJsAPI.ResourcePreview.md)\>

Returns [ResourcePreview](DataJsAPI.ResourcePreview.md)

___

### getResources

▸ **getResources**(): `Promise`<[`Resource`](DataJsAPI.Resource.md)[]\>

Get list of available resources.

**`remarks`**
The list contains only those resources available to the currently authenticated user.
Only administrator could access to resources.

#### Returns

`Promise`<[`Resource`](DataJsAPI.Resource.md)[]\>

___

### getSceneDefinition

▸ **getSceneDefinition**(`id`): `Promise`<[`SceneDefinition`](DataJsAPI.SceneDefinition.md)\>

Get saved scene definition using for [createScene](DataJsAPI.API.md#createscene)

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `string` |

#### Returns

`Promise`<[`SceneDefinition`](DataJsAPI.SceneDefinition.md)\>

___

### getScenes

▸ **getScenes**(): `Promise`<readonly [`ScenePreview`](DataJsAPI.ScenePreview.md)[]\>

Get list of available scenes.

**`remarks`**
The list contains only those scenes available to the currently authenticated user.
For anonymous users, only public scenes are available.

#### Returns

`Promise`<readonly [`ScenePreview`](DataJsAPI.ScenePreview.md)[]\>

___

### getUserInformation

▸ **getUserInformation**(): `Promise`<{ `features`: `any` ; `name`: `string` ; `organization`: `string` ; `role`: `string`  }\>

Get information about currently authenticated user

#### Returns

`Promise`<{ `features`: `any` ; `name`: `string` ; `organization`: `string` ; `role`: `string`  }\>

___

### getWKZones

▸ **getWKZones**(): `string`[]

#### Returns

`string`[]

___

### latLon2tm

▸ **latLon2tm**(`coords`, `tmZone`): `vec3`

#### Parameters

| Name | Type |
| :------ | :------ |
| `coords` | `GeoLocation` |
| `tmZone` | `string` |

#### Returns

`vec3`

___

### loadScene

▸ **loadScene**(`id`): `Promise`<[`SceneData`](DataJsAPI.SceneData.md) \| [`SceneLoadFail`](DataJsAPI.SceneLoadFail.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `string` |

#### Returns

`Promise`<[`SceneData`](DataJsAPI.SceneData.md) \| [`SceneLoadFail`](DataJsAPI.SceneLoadFail.md)\>

___

### putScene

▸ **putScene**(`scene`): `Promise`<`boolean`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `scene` | [`SceneData`](DataJsAPI.SceneData.md) |

#### Returns

`Promise`<`boolean`\>

___

### saveBookmarks

▸ **saveBookmarks**(`id`, `bookmarks`, `options?`): `Promise`<`boolean`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `string` |
| `bookmarks` | [`Bookmark`](DataJsAPI.Bookmark-1.md)[] |
| `options?` | `Object` |
| `options.group?` | `string` |
| `options.personal?` | `boolean` |

#### Returns

`Promise`<`boolean`\>

___

### tm2LatLon

▸ **tm2LatLon**(`position`, `tmZone`): `GeoLocation`

#### Parameters

| Name | Type |
| :------ | :------ |
| `position` | `vec3` |
| `tmZone` | `string` |

#### Returns

`GeoLocation`

___

### updateResource

▸ **updateResource**(`resource`): `Promise`<`boolean`\>

Update the specified resource in cloud storage.

**`remarks`**
Only administrator may update a resource.

**`throws`** Error in case of insufficient access rights.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `resource` | [`Resource`](DataJsAPI.Resource.md) | The [Resource](DataJsAPI.Resource.md) |

#### Returns

`Promise`<`boolean`\>

A boolean promise indicating when the operation is complete succesfully/failed.

___

### uploadResource

▸ **uploadResource**(`file`, `progress`, `revisionOf?`, `path?`, `split?`): `Promise`<{ `error?`: `string` ; `processId?`: `string`  }\>

Upload resource file

#### Parameters

| Name | Type |
| :------ | :------ |
| `file` | `File` |
| `progress` | (`progress`: `number`) => `void` |
| `revisionOf?` | `string` |
| `path?` | `string` |
| `split?` | `boolean` |

#### Returns

`Promise`<{ `error?`: `string` ; `processId?`: `string`  }\>
