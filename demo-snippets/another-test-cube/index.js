"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.demoName = exports.scene = exports.renderSettings = void 0;
/**
 * every snippet file must follow the same structure as below.
 */
const shared_1 = require("../../src/shared");
const render_settings_1 = __importDefault(require("./render-settings"));
exports.renderSettings = render_settings_1.default;
// used for screenshot file name or editor title. 
const demoName = 'another-test-cube';
exports.demoName = demoName;
// scene
const scene = shared_1.WellKnownSceneUrls.condos;
exports.scene = scene;
