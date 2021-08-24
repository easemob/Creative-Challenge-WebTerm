"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ICharacterJoinerService = exports.ISoundService = exports.ISelectionService = exports.IRenderService = exports.IMouseService = exports.ICoreBrowserService = exports.ICharSizeService = void 0;
var ServiceRegistry_1 = require("common/services/ServiceRegistry");
exports.ICharSizeService = ServiceRegistry_1.createDecorator('CharSizeService');
exports.ICoreBrowserService = ServiceRegistry_1.createDecorator('CoreBrowserService');
exports.IMouseService = ServiceRegistry_1.createDecorator('MouseService');
exports.IRenderService = ServiceRegistry_1.createDecorator('RenderService');
exports.ISelectionService = ServiceRegistry_1.createDecorator('SelectionService');
exports.ISoundService = ServiceRegistry_1.createDecorator('SoundService');
exports.ICharacterJoinerService = ServiceRegistry_1.createDecorator('CharacterJoinerService');
//# sourceMappingURL=Services.js.map