---
id: "index"
title: "novorender-api-docs"
sidebar_label: "Readme"
sidebar_position: 0
custom_edit_url: null
description: "for detailed measuring show distances, differences, elevations and more."
---

<img src="https://novorender.com/wp-content/uploads/2021/06/novorender_logo_RGB_2021.png"/>

# [NovoRender](http://novorender.com/)

> A measure API for NovoRender data models.

[![Latest NPM Version](https://img.shields.io/npm/v/@novorender/measure-api.svg?label=@novorender/measure-api)](https://www.npmjs.com/package/@novorender/data-js-api)

### NPM Module

## Installation

Measure API is available as an [NPM](https://www.npmjs.com/package/@novorender/measure-api) package. You can install Measure Api in your project's directory with npm:

```bash
$ npm install @novorender/measure-api
```

For bleeding edge builds:

```bash
$ npm install @novorender/measure-api@next
```

The package contains pre-bundled ES6 and UMD modules and typescript definition file that you can use for both local development and include in your web deployment.

## Getting started

Import the api

```ts
import * as Measure from "@novorender/measure-api";
```

Create api object

```ts
const api = await Measure.createMeasureAPI();
```

Load the scene, this is the object with measure functions related to the scene.
The scene url can be loaded from @novorender/data-api

```ts
const scene = api.loadScene(NovoRender.WellKnownSceneUrls.condos);
```
