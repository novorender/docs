"use strict";
/**
 * every snippet file must follow the same structure as below.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.demoName = exports.scene = exports.renderSettings = void 0;
const shared_1 = require("../../src/shared");
const render_settings_1 = __importDefault(require("./render-settings"));
exports.renderSettings = render_settings_1.default;
// used for screenshot file name or editor title. 
const demoName = 'simple-cube';
exports.demoName = demoName;
// scene
const scene = shared_1.WellKnownSceneUrls.cube;
exports.scene = scene;
